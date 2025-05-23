#!/bin/bash
source ../.env
FIRST=true
NET_NAME="sidegernet"
NUM_CONTAINERS=5
CONT_NAME="server"
USER="user"

echo "["
for i in $(seq 1 $NUM_CONTAINERS); do
  CURR_CONT_NAME=${CONT_NAME}_$i
  IP=$(docker inspect -f "{{.NetworkSettings.Networks.$NET_NAME.IPAddress}}" $CURR_CONT_NAME)
  INFO_NODE=$(ssh ${USER}@${IP} 'bash -s' < src/scripts/utils/resources_info.sh)
  if [ $FIRST = true ]; then
    FIRST=false
  else
    echo ","
  fi
  echo -n $INFO_NODE
done 
echo "]"
