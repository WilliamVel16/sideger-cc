#!/bin/bash
source ../.env
docker container run -d --rm -it --name ${CM_C} --net ${NET_NAME} --hostname ${CENTRAL_MANAGER_NAME} ${CM_I}
docker container run -d --rm -it --name ${EXE_C} --net ${NET_NAME} --hostname ${EXECUTE_HOSTNAME} ${EXE_I}
docker container run -d --rm -it --name ${EXE_C2} --net ${NET_NAME} --hostname ${EXECUTE_HOSTNAME_TWO} ${EXE_I}
docker container run -d --rm -it --name ${EXE_C3} --net ${NET_NAME} --hostname ${EXECUTE_HOSTNAME_THREE} ${EXE_I}
# cp htcondor examples
docker container run -d --rm -it -v /home/wvel/Documentos/GW/htcondor-clus/htcondor_examples:/htcondor_examples --name ${SUB_C} --net ${NET_NAME} --hostname ${SUBMIT_HOSTNAME} ${SUB_I}