from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "operator"
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: str
    tenant_name: Optional[str] = "Default Enterprise"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserRead"


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class UserRead(UserBase):
    id: str
    tenant_id: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


TokenResponse.model_rebuild()
