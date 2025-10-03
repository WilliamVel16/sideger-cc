from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None
    

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

    class Config:
        orm_mode = True

class LoginResponse(BaseModel):
    id: int
    full_name: str
    access_token: str
    token_type: str


class ResultBase(BaseModel):
    result: str
    execution_time: Optional[int] = None

class ResultCreate(ResultBase):
    pass

class ResultResponse(ResultBase):
    id: int
    class Config:
        orm_mode = True


class JobBase(BaseModel):
    universe: str
    job_name: str
    execution_date: Optional[datetime] = None
    execution_total_time: Optional[int] = None

class JobCreate(JobBase):
    user_id: int
    results: List[ResultCreate] = []

class JobResponse(JobBase):
    id: int
    results: List[ResultResponse]
    class Config:
        orm_mode = True