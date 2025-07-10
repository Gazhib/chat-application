import { Buffer } from "buffer";

export async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey"]
  );

  const rawPub = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const publicKeyBase64 = Buffer.from(rawPub).toString("base64");

  const rawPriv = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  const privateKeyBase64 = Buffer.from(rawPriv).toString("base64");

  await new Promise<void>(() => {
    const request = window.indexedDB.open("keyPairDb", 1);

    let db: IDBDatabase;
    request.onsuccess = (event) => {
      const target = event.target as IDBRequest;
      db = target.result as IDBDatabase;
      const tx = db.transaction("keyPairs", "readwrite");
      const store = tx.objectStore("keyPairs");

      store.put({
        public: publicKeyBase64,
        private: privateKeyBase64,
      });

      tx.oncomplete = () => {
        console.log("Key pair saved");
        db.close();
      };

      tx.onerror = () => {
        console.error("Error:", tx.error);
      };
    };

    request.onerror = (event) => {
      const target = event?.target as IDBRequest;
      console.log(target?.error?.message);
      console.log("Please allow me to use indexedDb");
    };

    request.onupgradeneeded = (event) => {
      const target = event?.target as IDBRequest;
      db = target.result as IDBDatabase;

      if (!db.objectStoreNames.contains("keyPairs")) {
        db.createObjectStore("keyPairs", { keyPath: "public" });
      }
    };
  });
  return keyPair;
}

async function importFromBase64(
  publicKeyBase64: string,
  privateKeyBase64: string
) {
  const publicKeyBuffer = Buffer.from(publicKeyBase64, "base64");
  const privateKeyBuffer = Buffer.from(privateKeyBase64, "base64");

  const publicKey = await crypto.subtle.importKey(
    "raw",
    publicKeyBuffer,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    []
  );

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey"]
  );

  return { publicKey, privateKey };
}

async function fetchPublicKey(cryptoPublicKey: CryptoKey) {
  const exportedPubKey = await crypto.subtle.exportKey("raw", cryptoPublicKey);
  const publicKey = Buffer.from(exportedPubKey).toString("base64");
  await fetch("http://localhost:3000/public-key", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ publicKey }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getKeyPair(): Promise<{
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("keyPairDb", 1);
    let db: IDBDatabase;

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const target = event?.target as IDBRequest;
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
        const result = getRequest.result;
        if (result.length === 0) {
          await generateKeyPair();
          const pair = await getKeyPair();
          await fetchPublicKey(pair.publicKey);
          resolve(pair);
        } else {
          const { public: pub, private: priv } = result[0];
          const pair = await importFromBase64(pub, priv);
          await fetchPublicKey(pair.publicKey);
          resolve(pair);
        }
      };
    };
  });
}

export async function getSharedKey(
  chatId: string,
  myId: string,
  privateKey: CryptoKey
) {
  const response = await fetch("http://localhost:3000/peer-public-key", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chatId, myId }),
    credentials: "include",
  });
  const responseData = await response.json();
  const rawPeerKey = Buffer.from(responseData.publicKey, "base64");
  const peerPublicKey = await crypto.subtle.importKey(
    "raw",
    rawPeerKey,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    []
  );

  const newSharedKey = await crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: peerPublicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
  return newSharedKey;
}

export async function decryptMessage(
  sharedKey: CryptoKey,
  message: { iv: string; data: string }
) {
  const iv = Buffer.from(message.iv, "base64");
  const data = Buffer.from(message.data, "base64");


  const ivBuf = iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength);
  const dataBuf = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBuf, tagLength: 128 },
    sharedKey,
    dataBuf
  );

  return new TextDecoder().decode(decrypted);
}

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
