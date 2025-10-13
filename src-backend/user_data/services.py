from sqlalchemy.orm import Session
from . import models

def get_clusters_by_user_id(db: Session, user_id: int):
    """
    gets all clusters of the user with their jobs and results
    """
    clusters = (
        db.query(models.Cluster)
        .filter(models.Cluster.user_id == user_id)
        .order_by(models.Cluster.created_at.desc())
        .all()
    )
    return clusters