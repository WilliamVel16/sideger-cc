from cluster.schemas import *
from typing import List
import subprocess
from containers.nodes import create_container_config, run_single_node
from htcondor.daemons import start_condor_master
from resources.onet import create_overlay_network, init_swarm_manager, get_worker_token, join_as_worker
from resources.manage_resources import get_min_specs
from fastapi import HTTPException

def initialize_cluster(nodes: List[NodeRole], resources_user: str, onetwork_name: str) -> InitializeClusterResponse:
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
    print(f"token: {token}")

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
    return { "nodes": results, "token": token }


def auto_assign_nodes(available_nodes: List[str], num_nodes_to_use: int, resources_user: str) -> AutoAssignResponse:
    """
    assings the role to every node to deploy the new cluster

    Args:
        available_nodes (List[str]): A list of the resources IPs
        num_nodes_to_use (int): The number of the resources selected by the user to use them in the cluster
        resources_user (str): User from the remote resources to connect using ssh

    returns:
        List[{node:, role:},]: a list of the resources with the roels assigned

    raises:
        HTTPException: if there aren't the minimum resources quantity to use in the cluster
    """

    if len(available_nodes) < 2:
        raise HTTPException(status_code=400, detail="there aren't minimum number nodes")
    
    # get the specs of all resources
    specs = get_min_specs(available_nodes, resources_user)
    print(specs)

    # ordering - criteria: RAM, CPU respectively
    ordered = sorted(specs, key=lambda n: (-n["ram_mb"], -n["cpu"], n["ip"]))
    print(ordered)

    # choose CM node and EXE nodes
    cm_node = ordered[0]
    print("cm node: ", cm_node)
    exe_nodes = ordered[1:num_nodes_to_use]
    print("exe nodes: ", exe_nodes)

    selected = [NodeRole(ip=cm_node["ip"], role="cm")]
    selected.extend([NodeRole(ip=n["ip"], role="exe") for n in exe_nodes])
    return AutoAssignResponse(selected_nodes=selected)


def add_new_nodes(nodes: List[NodeRole], resources_user: str, onetwork_name: str, token:str, n_execute_nodes: int) -> List[ClusterNodeResult]:
    """
    adds a new node with role 'execute' in the current active cluster

    Args:
        nodes (List[NodeRole]): A list of NodeRole objects, each specifying the IP address and role 'execute'
        resources_user (str): The username used for SSH connections to the nodes
        onetwork_name (str): The name of the overlay network of the active cluster
        token (str): The swarm manager token to join the new node into the swarm
        n_execute_nodes (int): Current number of the nodes with role 'execute'

    returns:
        List[ClusterNodeResult]: a list of ClusterNodeResult objects, each containing information
                                 about the deployment status and configuration of individual nodes.

    raises:
        HTTPException: If no nodes are provided or if no node with the 'cm' role is found.
    """
    if not nodes:
        raise HTTPException(status_code=404, detail=f"No nodes provided")

    # identifies the 'cm' (Condor Master/Swarm Manager)
    cm_node = next((node for node in nodes if node.role == "cm"), None)
    if cm_node is None:
        raise HTTPException(status_code=404, detail=f"Node with role 'cm' not found.")

    # connects all the new nodes to Swarm Manager
    for node in nodes:
        if node.ip != cm_node.ip:
            join_result = join_as_worker(node.ip, node.role, resources_user, token, cm_node.ip)
            print(f"[OK] (in join): {join_result}")

    # adds new nodes to the active cluster
    print("Adding node(s) with role 'execute'...")
    results = []
    for node in nodes:
        if node.ip != cm_node.ip:
            n_execute_nodes += 1
            hostname = f"{node.role}{n_execute_nodes}"
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
                message=f"Container {config.container_name} with role {config.role} added and condor_master started.",
                config=config
            ))
    return results
