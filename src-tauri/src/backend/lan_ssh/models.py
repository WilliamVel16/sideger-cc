from pydantic import BaseModel
from typing import List

class SSHConnectionRequest(BaseModel):
    resources_ips: List[str]
    resources_user: str
    resources_pass: str
    
class SSHConnectionResult(BaseModel):
    ip: str
    success: bool
    message: str

class ScanResourcesResult(BaseModel):
    ips: List[str]
