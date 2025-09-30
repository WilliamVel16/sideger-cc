from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import models, schemas
from core import security, database

router = APIRouter()

@router.post("/login", response_model=schemas.LoginResponse)
def login(user_data: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user or not security.verify_password(user_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    access_token = security.create_access_token({"user_id": user.id})
    return {
        "id": user.id,
        "full_name": f"{user.name} {user.lastname}",
        "role_id": user.role_id,
        "is_disabled": user.is_disabled,
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/create-user", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    hashed_password = security.hash_password(user.password)
    db_user = models.User(
        name=user.name,
        lastname=user.lastname,
        email=user.email,
        password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
