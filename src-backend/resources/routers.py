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

