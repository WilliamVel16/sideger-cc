#!/bin/bash
source ../.env
for i in ${CM_C} ${SUB_C} ${EXE_C} ${EXE_C2} ${EXE_C3}; do
  IP=$(docker inspect -f '{{.NetworkSettings.Networks.sidegernet.IPAddress}}' ${i})
  ssh user@$IP 'bash -s' < src/scripts/resources_info.sh
  echo Ok!
done