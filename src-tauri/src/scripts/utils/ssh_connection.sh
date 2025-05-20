#!/bin/bash
source ../.env
for i in ${CM_C} ${SUB_C} ${EXE_C} ${EXE_C2} ${EXE_C3}; do
  echo -n "Preparando conexión SSH con ${i}... " 
  docker container exec ${i} sh -c "echo ${USER_PASSWORD} | sudo -S service ssh start"
  IP=$(docker inspect -f '{{.NetworkSettings.Networks.sidegernet.IPAddress}}' ${i})
  sshpass -p ${USER_PASSWORD} ssh-copy-id -o StrictHostKeyChecking=no user@$IP
  echo Ok!
done