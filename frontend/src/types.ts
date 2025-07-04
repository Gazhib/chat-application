export type MessageSchema = {
  chatId: string;
  senderId: string;
  createdAt: string;
  seq: Number;
  messageType: string;
  status: {
    delievered: number;
    read: number;
  };
  cipher: {
    iv: string;
    data: string;
    tag: string;
  };
  meta: string;
};
