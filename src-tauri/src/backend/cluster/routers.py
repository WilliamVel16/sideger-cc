from fastapi import APIRouter, HTTPException
from typing import List
from cluster.schemas import NodeRole, ContainerConfig, ShutdownNodeResult, ClusterInitRequest, ClusterNodeResult
from cluster.deploy import initialize_cluster
from cluster.shutdown import shutdown_cluster

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
async def shutdown_cluster_endpoint(cluster_config: List[ContainerConfig]):
    try:
        result = shutdown_cluster(cluster_config)
        print(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))