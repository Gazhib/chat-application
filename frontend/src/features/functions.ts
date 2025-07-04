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
}
