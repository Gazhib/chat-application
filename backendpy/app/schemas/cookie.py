from pydantic import BaseModel
class Cookies(BaseModel):
    login: str
    role: str
    email: str
    isVerified: bool
    description: str | None = None
    profilePicture: str | None = None
    sub: str

