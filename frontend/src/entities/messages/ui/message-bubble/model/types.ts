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
  cipher: {
    iv: string;
    data: string;
  };
  meta: string;
  _id?: string;
  picture?: string;
  finishedAt?: string | Date;
  roomId?: string;
};
