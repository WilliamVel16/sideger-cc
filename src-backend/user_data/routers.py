from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas
from core import security, database
from .models import Cluster, Job, Result
from .services import get_clusters_by_user_id
from datetime import datetime
import pytz

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


# saves into db a new job with their results
@router.post("/save-job")
def save_job(job: schemas.JobCreateRegister, db: Session = Depends(database.get_db),
               current_user: models.User = Depends(security.get_current_user)):
    print("🧾 JOB DATA RECEIVED TO SAVE JOB:", job.dict())
    print(f"🧩 Saving job for user {current_user.id} in cluster {job.cluster_id}: {job.job_name}")
    try:
        db_job = models.Job(
            universe=job.universe,
            job_name=job.job_name,
            execution_date=job.execution_date,
            execution_total_time=job.execution_total_time,
            user_id=current_user.id,
            cluster_id=job.cluster_id
        )

        db.add(db_job)
        db.commit()
        db.refresh(db_job)

        # adds results
        if job.results:
            db_results = [
                models.Result(result=res.result, job_id=db_job.id)
                for res in job.results
            ]
            db.add_all(db_results)
            db.commit()
            db.refresh(db_job)

        cluster = db.query(models.Cluster).filter(models.Cluster.id == job.cluster_id).first()
        cluster_name = cluster.name if cluster else "Cluster desconocido"

        return {
            "message": f"Trabajo '{db_job.job_name}' guardado correctamente en el cluster '{cluster_name}' para el usuario '{current_user.name} {current_user.lastname}'."
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving job: {str(e)}")


@router.get("/clusters/db", response_model=List[schemas.ClusterResponse])
async def get_user_clusters(db: Session = Depends(database.get_db),
                            current_user: models.User = Depends(security.get_current_user)):
    """
    returns the clusters storaged in the DB of the authenticated user.
    builds all the data storaged for the specific cluster, including results.
    """
    clusters = get_clusters_by_user_id(db, current_user.id)
    if not clusters:
        return [] #if user doesn't have clusters
    return clusters


@router.delete("/cls/db/remove/{cluster_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_cluster(cluster_id: int, db: Session = Depends(database.get_db),
                              current_user: models.User = Depends(security.get_current_user)):
    """
    deletes a cluster storage in the DB from an user having as parameter the id of the
    cluster to remove.
    returns 204 no content (small message to confirm cluster deleted successfully) or
    404 NOT FOUND if the cluster doesn't exist
    """
    cluster_to_delete = db.query(Cluster).get(cluster_id)
    if not cluster_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cluster not found")

    db.delete(cluster_to_delete)
    db.commit()


@router.delete("/jbs/db/remove/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cluster_job(job_id: int, db: Session = Depends(database.get_db),
                              current_user: models.User = Depends(security.get_current_user)):
    """
    deletes a job storage in the DB from a cluster having as parameter the id of the
    job to remove.
    returns 204 no content (small message to confirm job deleted successfully) or
    404 NOT FOUND if the job doesn't exist
    """
    job_to_delete = db.query(Job).get(job_id)
    if not job_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    db.delete(job_to_delete)
    db.commit()


@router.delete("/res/db/remove/{result_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job_result(result_id: int, db: Session = Depends(database.get_db),
                              current_user: models.User = Depends(security.get_current_user)):
    """
    deletes a result storage in the DB from a job having as parameter the id of the
    result to remove.
    returns 204 no content (small message to confirm result deleted successfully) or
    404 NOT FOUND if the result doesn't exist
    """
    result_to_delete = db.query(Result).get(result_id)
    if not result_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found")

    db.delete(result_to_delete)
    db.commit()