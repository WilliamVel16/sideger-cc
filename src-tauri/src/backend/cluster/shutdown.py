from typing import List
from cluster.models import ContainerConfig, ShutdownNodeResult
from containers.nodes import stop_single_node
from resources.onet import leave_swarm, remove_overlay_network
from fastapi import HTTPException

def shutdown_cluster(cluster_config: List[ContainerConfig]) -> List[ShutdownNodeResult]:
    """
    shuts down the cluster and cleans up allocated resources iterating through each node
    in the cluster, stopping its running containers and making them leave the Docker Swarm.
    Finally, it removes the overlay network that was created for the cluster.

    args:
        cluster_config (List[ContainerConfig]): a list of ContainerConfig objects, each
                                                containing the configuration details of a node
                                                in the cluster, including its IP and role.

    returns:
        List[ShutdownNodeResult]: a list of ShutdownNodeResult objects, each
                                  indicating whether the resources on a specific node
                                  were successfully freed.

    raises:
        ValueError: if no configuration is provided or if no node with the 'cm' role is found.
        Exception: Propagates exceptions encountered during the stopping of containers,
                   leaving the swarm, or removing the overlay network.
    """
    if not cluster_config:
        raise HTTPException(status_code=404, detail="No cluster config provided")

    cm_node = next((n for n in cluster_config if n.role == "cm"), None)
    if cm_node is None:
        raise HTTPException(status_code=404, detail="No node with role 'cm' found.")

    results = []
    for node_config in cluster_config:
        # step 1: stop container in the node
        try:
            stop_result = stop_single_node(node_config)
            print(f"[OK] (in stop container): {stop_result}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"[ERR {node_config.ip}] (in stop container): {e}")

        # step 2: the node leaves the Swarm
        try:
            leave_result = leave_swarm(node_config)
            print(f"[OK] (in leave swarm): {leave_result}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"[ERR {node_config.ip}] (in leave): {e}")

        results.append(ShutdownNodeResult(
            free=True,
            message=f"El recurso {node_config.ip} con rol {node_config.role} ha sido liberado del cluster"
        ))

    # step 3: deletes the Overlay Network from central manager node
    try:
        remove_result = remove_overlay_network(cm_node)
        print(f"[OK] (in remove onet): {remove_result}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"[ERR {cm_node.ip}] (in remove onet): {e}")

    return results
