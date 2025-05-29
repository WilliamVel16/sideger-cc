#!/bin/bash
HOSTNAME="resource"
CONT_NAME="server"
NET_NAME="sidegernet"
IMAGE="wvel/resource:v1.0.1"
NUM_CONTAINERS=5

for i in $(seq 1 $NUM_CONTAINERS); do
  docker container run -d --rm -it --name ${CONT_NAME}_${i} --net $NET_NAME --hostname ${HOSTNAME}_${i} $IMAGE
done

# cp htcondor examples
#docker container run -d --rm -it -v /home/wvel/Documentos/GW/htcondor-clus/htcondor_examples:/htcondor_examples --name ${SUB_C} --net ${NET_NAME} --hostname ${SUBMIT_HOSTNAME} ${SUB_I}