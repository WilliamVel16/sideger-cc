from typing import List
from cluster.schemas import ContainerConfig, ShutdownNodeResult
from containers.nodes import stop_single_node
from resources.onet import leave_swarm, remove_overlay_network
from fastapi import HTTPException, Depends
from core import database
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from user_data.models import Cluster
from datetime import datetime
import pytz

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


def update_shutdown_field(cluster_id: int, db: Session = Depends(database.get_db)):
    """
    permits update the field of the current cluster of the session
    Args:
        cluster_id: current cluster to udate the field shutdown_at
        db: to get the cluster from db

    Returns:
        httpexception: if there is an error upadating the field
        message: success confirmation about the cluster field
    """
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster no encontrado")

    cluster.shutdown_at = datetime.now(pytz.timezone('America/Bogota'))
    db.commit()
    #db.refresh(cluster)
    return {"message": "shutdown_at field updated"}