#!/bin/bash
source ../.env
for i in ${CM_C} ${SUB_C} ${EXE_C} ${EXE_C2} ${EXE_C3}; do
  docker container exec ${i} sh -c "apt update && apt install curl -y && apt install sudo -y"
  rol=i.rol
  if [[$rol == "exe"]]; then
    echo "Instalando nodo de Ejecución en ${i}..."
    docker container exec ${i} sh -c "curl -fsSL https://get.htcondor.org | GET_HTCONDOR_PASSWORD="$HTCONDOR_PASSWORD" /bin/bash -s -- --no-dry-run --execute $CENTRAL_MANAGER_NAME"   
  elif [[$rol == "sub"]]; then
    echo "Instalando nodo de Punto de Acceso en ${i}..."
    docker container exec ${i} sh -c  "curl -fsSL https://get.htcondor.org | GET_HTCONDOR_PASSWORD="$HTCONDOR_PASSWORD" /bin/bash -s -- --no-dry-run --submit $CENTRAL_MANAGER_NAME"
  else 
    echo "Instalando nodo de Administrador Central en ${i}..."
    docker container exec ${i} sh -c  "curl -fsSL https://get.htcondor.org | GET_HTCONDOR_PASSWORD="$HTCONDOR_PASSWORD" /bin/bash -s -- --no-dry-run --central-manager $CENTRAL_MANAGER_NAME"
  fi
done