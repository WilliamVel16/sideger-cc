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

class ResultCreate(ResultBase):
    result: str

class ResultResponse(ResultBase):
    id: int
    class Config:
        orm_mode = True


class JobBase(BaseModel):
    universe: str
    job_name: str
    execution_date: str = None
    execution_total_time: Optional[str] = None

class JobCreateRegister(JobBase):
    cluster_id: Optional[int] = None
    results: List[ResultCreate] = []

class JobResponse(JobBase):
    id: int
    results: List[ResultResponse]
    class Config:
        orm_mode = True