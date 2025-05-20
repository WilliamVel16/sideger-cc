#!/bin/bash
source ../.env
echo "["
FIRST=true
for i in ${CM_C} ${SUB_C} ${EXE_C} ${EXE_C2} ${EXE_C3}; do
  IP=$(docker inspect -f '{{.NetworkSettings.Networks.sidegernet.IPAddress}}' ${i})
  INFO_NODE=$(ssh user@$IP 'bash -s' < src/scripts/utils/resources_info.sh)
  if [ $FIRST = true ]; then
    FIRST=false
  else
    echo ","
  fi 
  echo -n $INFO_NODE
done
echo "]"