#!/bin/bash
HOSTNAME="resource"
CONT_NAME="server"
NET_NAME="sidegernet"
IMAGE="wvel/resource:v1.0.1"
# 5 debe ser variable

for i in $(seq 1 5); do
  docker container run -d --rm -it --name ${CONT_NAME}_${i} --net $NET_NAME --hostname ${HOSTNAME}_${i} $IMAGE
done

#source ../.env
#docker container run -d --rm -it --name ${CM_C} --net ${NET_NAME} --hostname ${CENTRAL_MANAGER_NAME} ${CM_I}
#docker container run -d --rm -it --name ${EXE_C} --net ${NET_NAME} --hostname ${EXECUTE_HOSTNAME} ${EXE_I}
#docker container run -d --rm -it --name ${EXE_C2} --net ${NET_NAME} --hostname ${EXECUTE_HOSTNAME_TWO} ${EXE_I}
#docker container run -d --rm -it --name ${EXE_C3} --net ${NET_NAME} --hostname ${EXECUTE_HOSTNAME_THREE} ${EXE_I}
# cp htcondor examples
#docker container run -d --rm -it -v /home/wvel/Documentos/GW/htcondor-clus/htcondor_examples:/htcondor_examples --name ${SUB_C} --net ${NET_NAME} --hostname ${SUBMIT_HOSTNAME} ${SUB_I}