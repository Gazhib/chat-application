import { Buffer } from "buffer";
import { port } from "@util/ui/ProtectedRoutes";

// ─── Public-key upload deduplication ────────────────────────────────────────
// The public key only needs to be uploaded once per browser session (or when it
// changes). Tracking this at the module level avoids a network round-trip on
// every call to getKeyPair().
const KEY_PAIR_DB_NAME = "keyPairDb";
const LEGACY_KEY_PAIR_STORE = "keyPairs";
const CURRENT_KEY_PAIR_STORE = "keyPairsV2";
const CURRENT_KEY_PAIR_ID = "current";
const KEY_PAIR_DB_VERSION = 2;

type StoredKeyPairRecord = {
  id: string;
  public: string;
  private: string;
  createdAt: string;
};

type LegacyStoredKeyPairRecord = {
  public: string;
  private: string;
};

type CurrentUserCrypto = {
  publicKey: string | null;
  keyVersion: number;
};

let publicKeyUploaded = false;
let getKeyPairPromise:
  | Promise<{
      publicKey: CryptoKey;
      privateKey: CryptoKey;
    }>
  | null = null;

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

function openKeyPairDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(KEY_PAIR_DB_NAME, KEY_PAIR_DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const target = event.target as IDBRequest<IDBDatabase>;
      const db = target.result;

      if (!db.objectStoreNames.contains(LEGACY_KEY_PAIR_STORE)) {
        db.createObjectStore(LEGACY_KEY_PAIR_STORE, { keyPath: "public" });
      }

      if (!db.objectStoreNames.contains(CURRENT_KEY_PAIR_STORE)) {
        db.createObjectStore(CURRENT_KEY_PAIR_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      const target = event.target as IDBRequest<IDBDatabase>;
      resolve(target.result);
    };
  });
}

function exportPublicKeyBase64(cryptoPublicKey: CryptoKey): Promise<string> {
  return crypto.subtle
    .exportKey("raw", cryptoPublicKey)
    .then((rawPub) => Buffer.from(rawPub).toString("base64"));
}

function readCurrentStoredKeyPair(
  db: IDBDatabase
): Promise<StoredKeyPairRecord | undefined> {
  if (!db.objectStoreNames.contains(CURRENT_KEY_PAIR_STORE)) {
    return Promise.resolve(undefined);
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(CURRENT_KEY_PAIR_STORE, "readonly");
    const store = tx.objectStore(CURRENT_KEY_PAIR_STORE);
    const request = store.get(CURRENT_KEY_PAIR_ID);

    request.onerror = () => reject(request.error);
    request.onsuccess = () =>
      resolve(request.result as StoredKeyPairRecord | undefined);
  });
}

function readLegacyStoredKeyPairs(
  db: IDBDatabase
): Promise<LegacyStoredKeyPairRecord[]> {
  if (!db.objectStoreNames.contains(LEGACY_KEY_PAIR_STORE)) {
    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(LEGACY_KEY_PAIR_STORE, "readonly");
    const store = tx.objectStore(LEGACY_KEY_PAIR_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () =>
      resolve((request.result as LegacyStoredKeyPairRecord[]) ?? []);
  });
}

function persistCurrentStoredKeyPair(
  db: IDBDatabase,
  record: { public: string; private: string }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CURRENT_KEY_PAIR_STORE, "readwrite");
    const store = tx.objectStore(CURRENT_KEY_PAIR_STORE);

    store.put({
      id: CURRENT_KEY_PAIR_ID,
      public: record.public,
      private: record.private,
      createdAt: new Date().toISOString(),
    } satisfies StoredKeyPairRecord);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function persistCurrentKeyPair(
  publicKeyBase64: string,
  privateKeyBase64: string
): Promise<void> {
  const db = await openKeyPairDb();

  try {
    await persistCurrentStoredKeyPair(db, {
      public: publicKeyBase64,
      private: privateKeyBase64,
    });
  } finally {
    db.close();
  }
}

async function fetchCurrentUserCrypto(): Promise<CurrentUserCrypto | null> {
  try {
    const response = await fetch(`${port}/me`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) return null;

    const responseData = await response.json();
    return {
      publicKey:
        typeof responseData.publicKey === "string"
          ? responseData.publicKey
          : null,
      keyVersion: Number(responseData.keyVersion ?? 0),
    };
  } catch {
    return null;
  }
}

async function selectStoredKeyPairRecord(
  currentUserCrypto: CurrentUserCrypto | null
): Promise<{ public: string; private: string } | null> {
  const db = await openKeyPairDb();

  try {
    const current = await readCurrentStoredKeyPair(db);
    const legacy = await readLegacyStoredKeyPairs(db);
    const serverPublicKey = currentUserCrypto?.publicKey ?? null;

    if (serverPublicKey && current?.public === serverPublicKey) {
      return { public: current.public, private: current.private };
    }

    if (serverPublicKey) {
      const matchingLegacy = legacy.find(
        (record) => record.public === serverPublicKey
      );

      if (matchingLegacy) {
        await persistCurrentStoredKeyPair(db, matchingLegacy);
        return matchingLegacy;
      }
    }

    if (current) {
      return { public: current.public, private: current.private };
    }

    if (legacy.length === 1) {
      await persistCurrentStoredKeyPair(db, legacy[0]);
      return legacy[0];
    }

    return null;
  } finally {
    db.close();
  }
}

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );

  const publicKeyBase64 = await exportPublicKeyBase64(keyPair.publicKey);

  const rawPriv = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  const privateKeyBase64 = Buffer.from(rawPriv).toString("base64");

  await persistCurrentKeyPair(publicKeyBase64, privateKeyBase64);

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
  if (getKeyPairPromise) {
    return getKeyPairPromise;
  }

  getKeyPairPromise = (async () => {
    const currentUserCrypto = await fetchCurrentUserCrypto();
    const storedPair = await selectStoredKeyPairRecord(currentUserCrypto);

    if (storedPair) {
      const pair = await importFromBase64(storedPair.public, storedPair.private);

      // Keep the v2 store aligned so we never fall back to an arbitrary legacy
      // record again on the next session.
      await persistCurrentKeyPair(storedPair.public, storedPair.private);
      await uploadPublicKey(pair.publicKey);
      return pair;
    }

    if (currentUserCrypto?.publicKey) {
      console.warn(
        "[crypto] No local private key matched the server public key; generating a new key pair"
      );
    }

    const newKeyPair = await generateKeyPair();
    await uploadPublicKey(newKeyPair.publicKey);
    return newKeyPair;
  })().finally(() => {
    getKeyPairPromise = null;
  });

  return getKeyPairPromise;
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
