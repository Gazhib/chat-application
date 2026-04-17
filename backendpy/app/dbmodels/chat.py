from pydantic import BaseModel
from bson import ObjectId
from beanie import Document, Link

from datetime import datetime

class Chat(Document):
  creatorId: Link[ObjectId] #link to users
  membershipIds: Link[list[ObjectId]] #link to memberships
  chatType: str = "DIRECT"
  createdAt: datetime = datetime.utcnow()
  seq: int



