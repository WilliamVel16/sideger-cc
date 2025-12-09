import subprocess
from pathlib import Path
from typing import List, Union
import json
from fastapi import HTTPException

def show_resources_specs(resources_ips: List[str], resources_user: str) -> Union[dict, str]:
    """
    This function permits getting the software and hardware characteristics
    from the available 'servers' that could be used in the cluster. Executes
    a script in every resource using SSH to get its specifications.

    Example:
        Show info as: OS, DISK, RAM, CPU, GPU, HOSTNAME
    """
    script_path = Path("scripts/utils/resources_info.sh")
    if not script_path.exists():
        raise HTTPException(status_code=404, detail=f"Script not found at path: {script_path}")

    all_resources_info = []

    for ip in resources_ips:
        try:
            with open(script_path, "rb") as script_file:
                result = subprocess.run(
                    ["ssh", f"{resources_user}@{ip}", "bash -s"],
                    input=script_file.read(),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to execute show other specs script in {ip}: {e}")

        if result.returncode == 99: #resource no available for the cluster
            continue

        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"SSH to {ip} failed: {result.stderr.decode('utf-8')}")

        stdout = result.stdout.decode("utf-8")

        try:
            resource_info = json.loads(stdout)
            all_resources_info.append(resource_info)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Invalid JSON from {ip}: {e}\nOutput: {stdout}")
    print(all_resources_info)
    return all_resources_info


def get_min_specs(nodes_ips: List[str], resources_user: str) -> List[dict]:
    '''
    this function permits asign roles automaticaly to deploy the cluster
    
    params:
        - nodes_ips (List[str]): list of the nodes that can be selected to deploy the cluster
        - param resources_user: Descripción
    return List[{ip:, ram:, cpu:},]: list of the nodes with the information to asign roles
    '''
    script_path = Path("scripts/utils/min_specs.sh")
    if not script_path.exists():
        raise HTTPException(status_code=404, detail=f"Script not found: {script_path}")

    collected_specs = []

    for ip in nodes_ips:
        try:
            with open(script_path, "rb") as script_file:
                result = subprocess.run(
                    ["ssh", f"{resources_user}@{ip}", "bash -s"],
                    input=script_file.read(),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed SSH to {ip}: {e}")

        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"SSH to {ip} failed: {result.stderr.decode()}")

        stdout = result.stdout.decode()

        try:
            node_specs = json.loads(stdout)
            node_specs["ip"] = ip
            collected_specs.append(node_specs)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Invalid JSON from {ip}: {stdout}")
    return collected_specs



def show_my_specs(interface_lan_name: str) -> Union[dict, str]:
    """
    This function permits getting the software and hardware characteristics
    of the resource which the user is using Sideger on.

    Example:
        Show info as: OS, DISK, RAM, CPU, GPU, HOSTNAME
    """
    script_path = Path("scripts/utils/my_info.sh")

    if not script_path.exists():
        raise HTTPException(status_code=404, detail=f"Script not found at path: {script_path}")

    try:
        result = subprocess.run(
            ["bash", str(script_path), interface_lan_name],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to execute show my specs script: {e}")

    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=f"Script failed during execution: {result.stderr.decode('utf-8')}")

    stdout = result.stdout.decode("utf-8")

    try:
        my_info = json.loads(stdout)
        return my_info
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON output: {e}\nOutput: {stdout}")