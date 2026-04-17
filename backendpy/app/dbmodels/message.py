from beanie import Document, Indexed
from ..schemas.message import MessageModel
from bson import ObjectId
from typing import Annotated

class Message(MessageModel, Document):
  chatId: Annotated[ObjectId, Indexed()] #gotta change to ObjectId
 
