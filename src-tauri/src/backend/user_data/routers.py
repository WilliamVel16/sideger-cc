from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
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


# creates a new job with their results
@router.post("/save-job", response_model=schemas.JobResponse)
def create_job(job: schemas.JobCreate, db: Session = Depends(database.get_db)):
    db_job = models.Job(
        universe=job.universe,
        job_name=job.job_name,
        execution_date=job.execution_date,
        execution_total_time=job.execution_total_time,
        user_id=job.user_id
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    # add results
    if job.results:
        db_results = [
            models.Result(result=res.result, job_id=db_job.id)
            for res in job.results
        ]
        db.add_all(db_results)
        db.commit()
        db.refresh(db_job)

    return db_job


@router.get("/view-jobs", response_model=List[schemas.JobResponse])
def get_all_jobs(db: Session = Depends(database.get_db)):
    return db.query(models.Job).all()


@router.get("/user/{user_id}", response_model=List[schemas.JobResponse])
def get_jobs_by_user(user_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Job).filter(models.Job.user_id == user_id).all()