from fastapi import APIRouter
from typing import List
from htcondor.daemons import *
from containers.models import ContainerConfig

router = APIRouter()

@router.get("/condor-master", response_model=List[dict])
def condor_master(container_data: ContainerConfig) -> str:
    return start_condor_master(container_data)