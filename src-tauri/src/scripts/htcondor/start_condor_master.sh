#!/bin/bash
source ../../.env
for i in ${CM_C} ${SUB_C} ${EXE_C} ${EXE_C2} ${EXE_C3}; do
  echo -n "Iniciando demonio en \"${i}\"... "
  docker container exec "${i}" sh -c "echo \"$USER_PASSWORD\" | sudo -S condor_master"
  echo "Done!"
done