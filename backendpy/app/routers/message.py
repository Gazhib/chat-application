from fastapi import APIRouter, Depends
from ..schemas.message import MessageModel, MessageCipher, MessageStatus
from typing import Annotated

from ..schemas.cookie import Cookies

from ..dependencies import get_user_payload

router = APIRouter()


@router.post("/messages")
def send_message(message: MessageModel, user: Cookies = Depends(get_user_payload)) -> MessageModel:
  sender_id = user.sub
  chatId, cipher, picture, roomId, messageType = message.chatId, message.cipher, message.picture, message.roomId, message.messageType
  if picture and cipher:
    messageType = "mix"
  elif picture:
    messageType = "picture"
  
  if messageType != "call":
    messageType = "txt"
    
  
  
  
  
  
  return message
