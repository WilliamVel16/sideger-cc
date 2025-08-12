import subprocess
from cluster.models import ContainerConfig
from fastapi import HTTPException

def init_swarm_manager(manager_ip: str, resource_user: str) -> str:
    """
    initialize the docker swarm manager inside the node which will be running central
    manager (htcondor) container.
    
    Args:
        manager_ip (str): IP of the node with role 'cm' to connect to.
        resource_user (str): SSH user of that node

    Returns:
        str: output of the swarm initialization command. (or raise exception)
    """
    ssh_auth = f"{resource_user}@{manager_ip}"
    command = f"docker swarm init --advertise-addr {manager_ip}"

    try:
        result = subprocess.run(["ssh", ssh_auth, command],
                                capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize Docker Swarm on {manager_ip}: {e.stderr.strip()}")
    

def get_worker_token(manager_ip: str, resource_user: str) -> str:
    """
    recovery the worker join token to connect every worker to the Swarm

    Args:
        manager_ip (str): IP of the node with role 'cm' to get the token.
        resource_user (str): SSH user of that node

    Returns:
        str: output of the swarm join token command. (or raise exception)
    """
    ssh_auth = f"{resource_user}@{manager_ip}"
    command = "docker swarm join-token worker -q"

    try:
        result = subprocess.run(["ssh", ssh_auth, command],
                                capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to get token from {manager_ip}: {e.stderr.strip()}")


def join_as_worker(worker_ip: str, node_role: str, resource_user: str, token: str, manager_ip: str) -> str:
    """
    join a node with role 'sub' and 'exe' to the Swarm as Workers executing a script on others
    nodes that will be workers

    Args:
        worker_ip (str): IP address of the worker node to join.
        node_role (str): Role of the node, either 'sub' (submit) or 'exe' (execute).
        resource_user (str): SSH username to connect to the worker node.
        token (str): Docker Swarm worker join token.
        manager_ip (str): IP address of the Swarm manager node.

    Returns:
        str: confirmation message indicating the node has successfully joined. (or raise exception)
    """
    ssh_auth = f"{resource_user}@{worker_ip}"
    command = f"docker swarm join --token {token} --advertise-addr {worker_ip} {manager_ip}:2377"

    try:
        if node_role == "sub":
            result = subprocess.run(["sh", "-c", command], capture_output=True, text=True, check=True)
            print(result)
        else:
            result = subprocess.run(["ssh", ssh_auth, command], capture_output=True, text=True, check=True)
            print(result)

        return f"{worker_ip} joined as worker: {result}"
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Failed to join worker {worker_ip}: {e.stderr.strip()}")


def create_overlay_network(manager_ip: str, resource_user: str, onet_name: str) -> str:
    """
    creates the overlay network from the node with role 'cm'

    args: manager_ip (str): the ip of the node with role 'cm'
            resource_user (str): the user of the physical machine
            onet_name (str): the name to the Overlay Network
    """
    ssh_auth = f"{resource_user}@{manager_ip}"
    command = f"docker network create -d overlay --attachable {onet_name}"

    try:
        result = subprocess.run(["ssh", ssh_auth, command],
                                capture_output=True, text=True, check=True)
        print(result)
        return f"Overlay network {onet_name} created from {manager_ip}."
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Failed to create overlay network on {manager_ip}: {e.stderr.strip()}")


def remove_overlay_network(node_config: ContainerConfig) -> str:
    """
    Deletes the Docker overlay network from the swarm manager.
    This should be executed from the node with role 'cm' (central manager).
    
    If the overlay network does not exist, it returns a message indicating
    that the network was already removed or not found.
    """
    ssh_auth = f"{node_config.user}@{node_config.ip}"
    command = f"docker network rm {node_config.onetwork_name}"

    try:
        output = subprocess.run(
            ["ssh", ssh_auth, command],
            capture_output=True,
            text=True,
            check=False
        )
        stderr = output.stderr

        if output.returncode == 0:
            return f"Overlay network '{node_config.onetwork_name}' removed from {node_config.ip}"
        elif "not found" in stderr:
            return f"Overlay network '{node_config.onetwork_name}' did not exist on {node_config.ip} (already removed)"
        else:
            raise RuntimeError(f"Failed to remove overlay network on {node_config.ip}: {stderr}")

    except Exception as e:
        raise RuntimeError(f"SSH failed in {node_config.ip} trying to remove overlay network: {e}")


def leave_swarm(node_config: ContainerConfig) -> str:
    """
    Makes a node leave the Docker Swarm cluster.
    
    If the node is the swarm manager 'cm', it forces the leave operation.
    This helps to clean up swarm state on each cluster node.
    """
    ssh_auth = f"{node_config.user}@{node_config.ip}"
    command = "docker swarm leave --force" if node_config.role == "cm" else "docker swarm leave"

    try:
        if node_config.role == "sub":
            # 'sub' role assumed to be local
            output = subprocess.run(
                ["sh", "-c", command],
                capture_output=True,
                text=True,
                check=False
            )
        else:
            # SSH to remote machine
            output = subprocess.run(
                ["ssh", ssh_auth, command],
                capture_output=True,
                text=True,
                check=False
            )

        if output.returncode == 0:
            return f"{node_config.ip} left the swarm successfully"
        else:
            raise RuntimeError(f"Failed to leave swarm on {node_config.ip}: {output.stderr}")

    except Exception as e:
        raise RuntimeError(f"Error trying to leave swarm on {node_config.ip}: {e}")
