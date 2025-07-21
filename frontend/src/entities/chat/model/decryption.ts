import { Buffer } from "buffer";
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
