import subprocess
from cluster.models import ContainerConfig
from fastapi import HTTPException
import os


def create_container_config(ip: str, role: str, onetwork_name: str, hostname: str, user: str) -> ContainerConfig:
    if role == "cm":
        image = "wvel/sideger-cm:1.0.2"
    elif role == "sub":
        image = "wvel/sideger-sub:4.1.7"
    elif role == "exe":
        image = "wvel/sideger-exe:1.0.2"
    else:
        raise HTTPException(status_code=400, detail=f"Unknown role: {role}")


    container_name = f"{role}_{ip.replace('.', '_')}"

    return ContainerConfig(
        ip=ip,
        role=role,
        image=image,
        container_name=container_name,
        onetwork_name=onetwork_name,
        hostname=hostname,
        user=user
    )


def run_single_node(config: ContainerConfig) -> str:
    """
    this function sets the roles of every node in the pool before
    to start the pool using as input every node ip and its role.
    Uses images from dockerhub to run the containers with one of
    the following roles: central manager, submit or execute
    
    Example:    
        input: "172.19.0.6", "cm"
        process: runs into node with ip 172.19.0.6 a container with role
                cm of htcondor.
        output: node name using nomenclature cm_172_19_0_6
    """
    ssh_auth = f"{config.user}@{config.ip}"
    command = (
        f"docker container run -d --rm -it --name {config.container_name} "
        f"--net {config.onetwork_name} --hostname {config.hostname} {config.image}"
    )
    
    try:
        if config.role == "sub":
            
            HOME_DIR = os.path.expanduser("~")
            jobs_directory_path = os.path.join(HOME_DIR, "sideger_jobs")
            command = command.replace(f"{config.image}", f"-v {jobs_directory_path}:/sideger-jobs {config.image}")
            print(command)

            output = subprocess.run(
                ["sh", "-c", command],
                capture_output=True,
                check=False,
                text=True
            )
        else:
            output = subprocess.run(
                ["ssh", ssh_auth, command],
                capture_output=True,
                check=False,
                text=True
            )

        if output.returncode == 0:
            return f"Container {config.container_name} launched on {config.ip} successfully with role {config.role}"
        else:
            raise HTTPException(status_code=402, detail=f"Failed running container on {config.ip}: {output.stderr}")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error in running single node on: {config.ip} {str(e)}")


def stop_single_node(node_config: ContainerConfig) -> str:
    """
    this function stops the container running in the physical resource
    
    Example:
        process: runs a command to stop the container with any rol
    """
    ssh_auth = f"{node_config.user}@{node_config.ip}"
    command = f"docker stop {node_config.container_name}"

    try:
        if node_config.role == "sub":
            output = subprocess.run(
                ["sh", "-c", command],
                capture_output=True,
                check=False,
                text=True
            )
        else:
            output = subprocess.run(
                ["ssh", ssh_auth, command],
                capture_output=True,
                check=False,
                text=True
            )

        if output.returncode == 0:
            return f"Container {node_config.container_name} with role {node_config.role} stopped on {node_config.ip}"
        else:
            raise HTTPException(status_code=402, detail=f"Failed stopping container on {node_config.ip}: {output.stderr}")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error in stop node on {node_config.ip}: {str(e)}")