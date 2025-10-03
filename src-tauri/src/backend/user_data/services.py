from sqlalchemy.orm import Session
from . import models

def get_jobs_by_user_id(db: Session, user_id: int):
    return db.query(models.Job).filter(models.Job.user_id == user_id).all()