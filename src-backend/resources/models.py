from pydantic import BaseModel
from typing import List

class ResourcesDataRequest(BaseModel):
    resources_ips: List[str]
    resources_user: str