from fastapi import Depends, Request, HTTPException,status
from .schemas.cookie import Cookies


async def get_user_payload(request: Request) -> Cookies:
  if not hasattr(request.state, "user_payload"):
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="unauthorized user")
  return request.state.user_payload