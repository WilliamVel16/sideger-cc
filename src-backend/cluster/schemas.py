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

class ShutdownRequest(BaseModel):
    cluster_id: int
    nodes: List[ContainerConfig]

class ClusterInitRequest(BaseModel):
    nodes: List[NodeRole]
    resources_user: str
    onetwork_name: str

class ClusterAddNodes(ClusterInitRequest):
    token: str
    n_execute_nodes: int
    

class ClusterNodeResult(BaseModel):
    message : str
    config: ContainerConfig

class InitializeClusterResponse(BaseModel):
    nodes: List[ClusterNodeResult]
    token: str


class ShutdownNodeResult(BaseModel):
    free: bool
    message: str


class ClusterSaveData(BaseModel):
    name: str
    number_nodes: int
    user_id: int