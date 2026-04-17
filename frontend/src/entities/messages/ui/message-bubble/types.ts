// Decryption lifecycle for a message in the UI layer:
//   'decrypted' — plaintext is available in `meta`
//   'failed'    — decryption was attempted but crypto.subtle threw (wrong key, corrupted cipher)
//   'pending'   — shared key not yet derived; message arrived via socket before handleDecrypting ran
//   'none'      — message type does not carry an encrypted payload (e.g. call records)
export type EncryptionStatus = "decrypted" | "failed" | "pending" | "none";

export type MessageSchema = {
  chatId: string;
  senderId: string;
  createdAt: string | Date;
  seq: Number;
  messageType: string;
  status: {
    delievered: number;
    read: number;
  };
  // Optional: call-type messages may not carry a cipher payload.
  cipher?: {
    iv: string;
    data: string;
  };
  // Algorithm version tag stored by the server. 1 = ECDH-P256 / AES-GCM-256.
  encVersion?: number;
  // Decryption state. Absent on raw server responses; set by crypto layer before
  // messages enter the Zustand store.
  encryptionStatus?: EncryptionStatus;
  meta: string;
  _id?: string;
  picture?: string;
  finishedAt?: string | Date;
  roomId?: string;
};
