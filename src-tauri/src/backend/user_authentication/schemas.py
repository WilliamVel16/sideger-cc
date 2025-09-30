from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    lastname: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    lastname: str
    email: EmailStr
    role_id: int
    is_disabled: bool

    class Config:
        orm_mode = True

class LoginResponse(BaseModel):
    id: int
    full_name: str
    role_id: int
    is_disabled: bool
    access_token: str
    token_type: str
