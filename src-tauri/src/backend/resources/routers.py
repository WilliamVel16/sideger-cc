from fastapi import APIRouter
from typing import List
from resources.manage_resources import *
from resources.onet import *
from containers.models import ContainerConfig
from resources.models import ResourcesDataRequest

router = APIRouter()

@router.post("/other-specs", response_model=List[dict])
def specs_all(req: ResourcesDataRequest):
    return show_resources_specs(req.resources_ips, req.resources_user)

@router.get("/my-specs", response_model=dict)
def specs_self(interface_lan_name: str):
    return show_my_specs(interface_lan_name)

"""
@router.post("/create-onet", response_model=str)
def create_onet(manager_ip: str, user: str, onet_name: str) -> str:
    return create_overlay_network(manager_ip, user, onet_name)

@router.post("/remove-onet", response_model=str)
def remoeve_onet(container_config: ContainerConfig) -> str:
    return remove_overlay_network(container_config)

@router.post("/leave-swarm", response_model=str)
def leave_swarm(container_config: ContainerConfig) -> str:
    return leave_swarm(container_config)
    """