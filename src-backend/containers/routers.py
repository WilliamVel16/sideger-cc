from fastapi import APIRouter
from containers.models import ContainerConfig
from containers.nodes import *

router = APIRouter()

@router.post("/run-containers", response_model=str)
def run_containers(container_data: ContainerConfig) -> str:
    return run_single_node(container_data)

@router.post("/stop-containers", response_model=str)
def stop_containers(container_data: ContainerConfig) -> str:
    return stop_single_node(container_data)