import os
import subprocess
from fastapi import HTTPException
from pathlib import Path
from typing import List
import netifaces
from lan_ssh.models import ScanResourcesResult, SSHConnectionResult

def script_permissions() -> str:
    """
    allows to give permissions to run scripts to configure the 
    network and prepare the resources founded on the LAN, iterates
    for every .sh file inside the directory to give execution permission

    Example:
        allows the app to run a script to scan the LAN
    """
    scripts_dir = Path("../local-scripts")
    if not scripts_dir.exists():
        raise FileNotFoundError("The directory local-scripts doesn't exist")

    for file in scripts_dir.iterdir():
        if file.suffix == ".sh":
            os.chmod(file, 0o755)

    return "Permissions correctly assigned"


def scan_interfaces() -> List[str]:
    """
    this function allows scan the network interfaces
    """
    try:
        interfaces = netifaces.interfaces()
        return list(set(interfaces))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error to obtain interfaces: {e}")


def scan_lan_resources(interface_lan_name: str, local_password: str) -> ScanResourcesResult:
    """
    this function allows scan the allowed resources in the network
    """
    script_path = Path("../local-scripts/get_resources_up.sh")
    if not script_path.exists():
        raise HTTPException(status_code=404, detail="Script doesn't exist")

    try:
        result = subprocess.run(
            [str(script_path), interface_lan_name, local_password],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )

        if result.returncode == 0:
            lines = result.stdout.decode("utf-8").splitlines()
            ips = [line.strip() for line in lines if line.strip()]
            return ScanResourcesResult(ips=ips)
        else:
            raise HTTPException(status_code=400, detail=f"Script internal error: {result.stderr.decode('utf-8')}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error to execute script: {e}")


def get_my_ip(interface_lan_name: str) -> str:
    """
    this function gets the local ip of the machine where user is using the 
    Sideger app
    """
    try:
        addresses = netifaces.ifaddresses(interface_lan_name)
        ipv4_info = addresses.get(netifaces.AF_INET)
        if ipv4_info:
            return ipv4_info[0]["addr"]
        else:
            raise HTTPException(status_code=404, detail="No IPv4 address found for the interface")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error getting IP for interface {interface_lan_name}: {e}")


def start_ssh_connection(resources_ips: List[str], resources_user: str, resources_pass: str) -> List[SSHConnectionResult]:
    """
    this function starts the SSH conenection con every available resource
    in the local network
    
    Example:
        copy the public keys from the server where sideger is being use inside
        of the other available servers of the network
    """
    script_path = Path("../scripts/utils/ssh_connection.sh") 
    if not script_path.exists():
        raise HTTPException(status_code=404, detail=f"Script not found in path: {script_path}")

    results = []

    for ip in resources_ips:
        try:
            result = subprocess.run(
                ["bash", str(script_path), resources_user, resources_pass, ip],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False
            )

            if result.returncode == 0:
                results.append(SSHConnectionResult(
                    ip=ip,
                    success=True,
                    message=result.stdout.decode("utf-8")
                ))
            else:
                results.append(SSHConnectionResult(
                    ip=ip,
                    success=False,
                    message=result.stderr.decode("utf-8")
                ))

        except Exception as e:
            results.append(SSHConnectionResult(
                ip=ip,
                success=False,
                message=str(e)
            ))
    print(results)
    return results
