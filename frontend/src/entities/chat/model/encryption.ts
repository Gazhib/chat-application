import { Buffer } from "buffer";
import { port } from "@util/ui/ProtectedRoutes";

// ─── Public-key upload deduplication ────────────────────────────────────────
// The public key only needs to be uploaded once per browser session (or when it
// changes). Tracking this at the module level avoids a network round-trip on
// every call to getKeyPair().
let publicKeyUploaded = false;

export class PeerPublicKeyUnavailableError extends Error {
  chatId: string;

  constructor(chatId: string) {
    super(`Peer public key is not available for chat ${chatId}`);
    this.name = "PeerPublicKeyUnavailableError";
    this.chatId = chatId;
  }
}

export function isPeerPublicKeyUnavailableError(
  error: unknown
): error is PeerPublicKeyUnavailableError {
  return error instanceof PeerPublicKeyUnavailableError;
}

// ─── Key pair generation & IDB persistence ──────────────────────────────────

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );

  const rawPub = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const publicKeyBase64 = Buffer.from(rawPub).toString("base64");

  const rawPriv = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  const privateKeyBase64 = Buffer.from(rawPriv).toString("base64");

  // FIXED: the original Promise executor took no arguments, so resolve() was
  // never called and the await hung forever on first-ever use.
  await new Promise<void>((resolve, reject) => {
    const request = window.indexedDB.open("keyPairDb", 1);
    let db: IDBDatabase;

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const target = event.target as IDBRequest;
      db = target.result as IDBDatabase;
      if (!db.objectStoreNames.contains("keyPairs")) {
        db.createObjectStore("keyPairs", { keyPath: "public" });
      }
    };

    request.onsuccess = (event) => {
      const target = event.target as IDBRequest;
      db = target.result as IDBDatabase;
      const tx = db.transaction("keyPairs", "readwrite");
      const store = tx.objectStore("keyPairs");
      store.put({ public: publicKeyBase64, private: privateKeyBase64 });
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
  });

  return keyPair;
}

async function importFromBase64(
  publicKeyBase64: string,
  privateKeyBase64: string
): Promise<CryptoKeyPair> {
  const publicKeyBuffer = Buffer.from(publicKeyBase64, "base64");
  const privateKeyBuffer = Buffer.from(privateKeyBase64, "base64");

  const publicKey = await crypto.subtle.importKey(
    "raw",
    publicKeyBuffer,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );

  return { publicKey, privateKey };
}

// Uploads the local public key to the server so peers can derive a shared key.
// Idempotent within a session: skips the round-trip if the key was already sent.
async function uploadPublicKey(cryptoPublicKey: CryptoKey): Promise<void> {
  if (publicKeyUploaded) return;

  const exportedPubKey = await crypto.subtle.exportKey("raw", cryptoPublicKey);
  const publicKey = Buffer.from(exportedPubKey).toString("base64");

  const response = await fetch(`${port}/public-key`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ publicKey }),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to upload public key (status ${response.status})`);
  }

  publicKeyUploaded = true;
}

// ─── Key pair retrieval ──────────────────────────────────────────────────────

export async function getKeyPair(): Promise<{
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("keyPairDb", 1);
    let db: IDBDatabase;

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const target = event.target as IDBRequest;
      db = target.result as IDBDatabase;
      if (!db.objectStoreNames.contains("keyPairs")) {
        db.createObjectStore("keyPairs", { keyPath: "public" });
      }
    };

    request.onsuccess = (event) => {
      const target = event.target as IDBRequest;
      db = target.result;
      const transaction = db.transaction("keyPairs", "readonly");
      const store = transaction.objectStore("keyPairs");
      const getRequest = store.getAll();

      getRequest.onerror = () => reject(getRequest.error);

      getRequest.onsuccess = async () => {
        try {
          const result = getRequest.result as Array<{
            public: string;
            private: string;
          }>;

          if (result.length === 0) {
            // First ever use: generate, persist, then upload.
            const newKeyPair = await generateKeyPair();
            await uploadPublicKey(newKeyPair.publicKey);
            resolve(newKeyPair);
          } else {
            const { public: pub, private: priv } = result[0];
            const pair = await importFromBase64(pub, priv);
            await uploadPublicKey(pair.publicKey);
            resolve(pair);
          }
        } catch (e) {
          reject(e);
        }
      };
    };
  });
}

// ─── Shared key derivation ───────────────────────────────────────────────────

// Fetches the peer's current public key from the server and derives the shared
// AES-GCM-256 key via ECDH. Returns the key together with the server-assigned
// keyVersion so callers can cache by (chatId, keyVersion) and invalidate when
// the peer rotates their key pair (e.g. new device login).
export async function getSharedKey(
  chatId: string,
  privateKey: CryptoKey
): Promise<{ key: CryptoKey; keyVersion: number }> {
  const response = await fetch(`${port}/peer-public-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId }),
    credentials: "include",
  });

  if (response.status === 404) {
    throw new PeerPublicKeyUnavailableError(chatId);
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch peer public key (status ${response.status})`
    );
  }

  const responseData = await response.json();
  // keyVersion is returned by the updated backend spec; default to 0 for
  // legacy backends that haven't been updated yet.
  const keyVersion: number = responseData.keyVersion ?? 0;

  const rawPeerKey = Buffer.from(responseData.publicKey, "base64");
  const peerPublicKey = await crypto.subtle.importKey(
    "raw",
    rawPeerKey,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );

  // non-extractable: the derived shared key never leaves the crypto subsystem.
  const sharedKey = await crypto.subtle.deriveKey(
    { name: "ECDH", public: peerPublicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return { key: sharedKey, keyVersion };
}

// ─── Message encryption / decryption primitives ──────────────────────────────

export async function encryptMessage(typed: string, sharedKey: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedMessage = new TextEncoder().encode(typed);
  const cipherText = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    sharedKey,
    encodedMessage
  );

  const dataBuffer = Buffer.from(cipherText).toString("base64");
  const ivBuffer = Buffer.from(iv).toString("base64");

  return { data: dataBuffer, iv: ivBuffer };
}
