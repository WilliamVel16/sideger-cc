from pydantic import BaseModel
from typing import List, Literal

class NodeRole(BaseModel):
    ip: str
    role: str


class ContainerConfig(BaseModel):
    ip: str
    role: Literal["cm", "sub", "exe"]
    image: str
    container_name: str
    onetwork_name: str
    hostname: str
    user: str


class ClusterInitRequest(BaseModel):
    nodes: List[NodeRole]
    resources_user: str
    onetwork_name: str
    

class ClusterNodeResult(BaseModel):
    message : str 
    config: ContainerConfig


class ShutdownNodeResult(BaseModel):
    free: bool
    message: str