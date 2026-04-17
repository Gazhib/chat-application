from datetime import datetime
from pydantic import BaseModel
from bson import ObjectId

class MessageStatus(BaseModel):
  delievered: int
  read: int
  
class MessageCipher(BaseModel):
  iv: str
  data: str


class MessageModel(BaseModel):
  chatId: ObjectId #gotta change to ObjectId
  senderId: ObjectId | None = None #same
  createdAt: datetime | None = datetime.utcnow()
  seq: int | None = None
  messageType: str
  status: MessageStatus = MessageStatus(delievered=0, read=0)
  cipher: MessageCipher
  picture: str
  finishedAt: datetime | None = None
  roomId: str | None = None
  