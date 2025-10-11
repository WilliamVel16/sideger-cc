import subprocess
from cluster.schemas import ContainerConfig

def start_condor_master(config: ContainerConfig) -> str:
    """
    This function permits to start the HTCondor pool, running the base
    daemon on every node that will be used in the cluster.
    
    Example:
        Executes the command: condor_master inside the container
    """
    ssh_auth = f"{config.user}@{config.ip}"
    command = (
        f"docker container exec {config.container_name} sh -c 'echo pass123 | sudo -S condor_master'") #OJO, USO PASSWORD TEMPORAL

    try:
        if config.role == "sub":
            output = subprocess.run(
                ["bash", "-c", command],
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
            return f"condor_master started on {config.container_name}"
        else:
            raise RuntimeError(
                f"Failed to start condor_master on {config.container_name}: {output.stderr}"
            )

    except Exception as e:
        raise RuntimeError(
            f"Error starting condor_master on {config.container_name}: {str(e)}"
        )
