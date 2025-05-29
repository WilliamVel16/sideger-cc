#!/bin/bash
CONT_NAME="server"
NET_NAME="sidegernet"
# 5 debe ser variable 
source ../.env

for i in $(seq 1 5); do
  echo -n "Preparando conexión SSH con ${CONT_NAME}_${i}... "
  docker container exec ${CONT_NAME}_${i} sh -c "echo ${USER_PASSWORD} | sudo -S service ssh start"
  IP=$(docker inspect -f "{{.NetworkSettings.Networks.${NET_NAME}.IPAddress}}" ${CONT_NAME}_${i})
  sshpass -p ${USER_PASSWORD} ssh-copy-id -o StrictHostKeyChecking=no user@$IP
  echo Ok!
done

#source ../.env
#for i in ${CM_C} ${SUB_C} ${EXE_C} ${EXE_C2} ${EXE_C3}; do
#  echo -n "Preparando conexión SSH con ${i}... " 
#  docker container exec ${i} sh -c "echo ${USER_PASSWORD} | sudo -S service ssh start"
#  IP=$(docker inspect -f '{{.NetworkSettings.Networks.sidegernet.IPAddress}}' ${i})
#  sshpass -p ${USER_PASSWORD} ssh-copy-id -o StrictHostKeyChecking=no user@$IP
#  echo Ok!
#done