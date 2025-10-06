from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from cluster.schemas import NodeRole, ShutdownRequest, ShutdownNodeResult, ClusterInitRequest, ClusterSaveData
from cluster.deploy import initialize_cluster
from cluster.shutdown import shutdown_cluster, update_shutdown_field
from user_data.models import Cluster
from core import security, database

router = APIRouter()

@router.post("/initialize")
async def initialize_cluster_endpoint(req: ClusterInitRequest):
    try:
        result = initialize_cluster(req.nodes, req.resources_user, req.onetwork_name)
        print(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing cluster{str(e)}")
    

@router.post("/shutdown", response_model=List[ShutdownNodeResult])
async def shutdown_cluster_endpoint(request: ShutdownRequest, db: Session = Depends(database.get_db)):
    '''
    poweroff the containers of a cluster and updates the 'shutdown_at' field
    if the poweroff proces is ok
    Args:
        request: containes the nodes configuration and current cluester id
        db: conection to do the request
    Returns:
        message: confirmation of the nodes incating that they are free now
        httpexception: error during the shutdown process
    '''
    try:
        result = shutdown_cluster(request.nodes)
        print(result)
        update_shutdown_field(request.cluster_id, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save-cluster-data")
async def save_cluster_data(cluster_data: ClusterSaveData, db: Session = Depends(database.get_db)):
    try:
        new_cluster = Cluster(
            name=cluster_data.name,
            number_nodes=cluster_data.number_nodes,
            created_at=func.now(),
            shutdown_at=None,
            user_id=cluster_data.user_id,
        )
        db.add(new_cluster)
        db.commit()
        db.refresh(new_cluster)
        return {"message": "Cluster registrado exitosamente", "cluster_id": new_cluster.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error registering cluster data in db: {str(e)}")