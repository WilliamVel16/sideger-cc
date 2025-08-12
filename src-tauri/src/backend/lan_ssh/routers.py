from fastapi import APIRouter, Query
from typing import List
from lan_ssh.models import SSHConnectionRequest, SSHConnectionResult, ScanResourcesResult
from lan_ssh.lan_services import *

router = APIRouter()

@router.get("/permissions", response_model=str)
def set_script_permissions():
    return script_permissions()

@router.get("/interfaces", response_model=List[str])
def get_interfaces():
    return scan_interfaces()

@router.get("/scan-resources", response_model=ScanResourcesResult)
def scan_resources(interface_lan_name: str, local_password: str):
    return scan_lan_resources(interface_lan_name, local_password)

@router.get("/my-ip", response_model=str)
def get_my_ip_address(interface_lan_name: str = Query(..., description="Interface name like eth0")):
    return get_my_ip(interface_lan_name)

@router.post("/connect", response_model=List[SSHConnectionResult])
def ssh_connect(req: SSHConnectionRequest):
    return start_ssh_connection(req.resources_ips, req.resources_user, req.resources_pass)