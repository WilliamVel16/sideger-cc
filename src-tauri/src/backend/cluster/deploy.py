from cluster.schemas import *
from typing import List
import subprocess
from containers.nodes import create_container_config, run_single_node
from htcondor.daemons import start_condor_master
from resources.onet import create_overlay_network, init_swarm_manager, get_worker_token, join_as_worker
from fastapi import HTTPException

def initialize_cluster(nodes: List[NodeRole], resources_user: str, onetwork_name: str) -> List[ClusterNodeResult]:
    """
    initializes a cluster using Docker Swarm and runs the HTCondor base daemon,
    in other wordsc orchestrates the setup of a distributed computing cluster

    Args:
        nodes (List[NodeRole]): A list of NodeRole objects, each specifying the IP address and
                                 role ('cm', 'submit', 'execute') of a node in the cluster
        resources_user (str): The username used for SSH connections to the nodes
        onetwork_name (str): The name for the overlay network to be created

    returns:
        List[ClusterNodeResult]: a list of ClusterNodeResult objects, each containing information
                                 about the deployment status and configuration of individual nodes.

    raises:
        HTTPException: If no nodes are provided or if no node with the 'cm' role is found.
    """
    if not nodes:
        raise HTTPException(status_code=404, detail=f"No nodes provided")

    # step 1: identifies the 'cm' (Condor Master/Swarm Manager) node and initializes Docker Swarm on it
    cm_node = next((node for node in nodes if node.role == "cm"), None)
    if cm_node is None:
        raise HTTPException(status_code=404, detail=f"Node with role 'cm' not found.")

    print(f"[1] Initializing swarm manager: {cm_node.ip}")
    init_swarm_result = init_swarm_manager(cm_node.ip, resources_user)
    print(f"[OK] (in init): {init_swarm_result}")


    # step 2: get the worker join token to connect Workers to the Swarm Manager 
    token = get_worker_token(cm_node.ip, resources_user)
    print(f"this is the token: {token}")

    # step 3: connects all the workers(submit or execute from condor) to Swarm Manager
    for node in nodes:
        if node.ip != cm_node.ip:
            print(f"[3] {node.ip} - joining to swarm as worker")
            join_result = join_as_worker(node.ip, node.role, resources_user, token, cm_node.ip)
            print(f"[OK] (in join): {join_result}")

    # step 4: creates an overlay network on the Swarm Manager to facilitate communication between containers
    print(f"[4] creating overlay network: {onetwork_name}")
    overlay_result = create_overlay_network(cm_node.ip, resources_user, onetwork_name)
    print(f"Overlay network created successfully:\n{overlay_result}")

    # step 5: deploys individual containers on each node, assigns hostnames, and starts the HTCondor base daemon.
    print("[5] Deploying containers...")
    results = []
    role_counts = {}

    for node in nodes:
        count = role_counts.get(node.role, 0) + 1
        role_counts[node.role] = count

        hostname = "sidegerCM" if node.role == "cm" else f"{node.role}{count}"

        config = create_container_config(
            ip=node.ip,
            role=node.role,
            onetwork_name=onetwork_name,
            hostname=hostname,
            user=resources_user
        )   

        run_result = run_single_node(config)
        print(f"[OK] (in run) {run_result}")

        condor_result = start_condor_master(config)
        print(f"[OK] (in condor): {condor_result}")

        results.append(ClusterNodeResult(
            message=f"Container {config.container_name} with role {config.role} deployed and condor_master started.",
            config=config
        ))
        

    return results