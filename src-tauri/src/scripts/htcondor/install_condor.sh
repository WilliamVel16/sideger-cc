#!/bin/bash
ROLE="$1" 
CENTRAL_MANAGER_NAME="$2"
HTCONDOR_PASSWORD="$3"

if [ -z "$ROLE" ] || [ -z "$CENTRAL_MANAGER_NAME" ] || [ -z "$HTCONDOR_PASSWORD" ]; then
  echo "Uso: $0 <rol> <nombre_central_manager> <clave>"
  exit 1
fi

case $ROLE in
  central-manager)
    curl -fsSL https://get.htcondor.org | GET_HTCONDOR_PASSWORD="$HTCONDOR_PASSWORD" /bin/bash -s -- --no-dry-run --central-manager "$CENTRAL_MANAGER_NAME"
    ;;
  submit)
    curl -fsSL https://get.htcondor.org | GET_HTCONDOR_PASSWORD="$HTCONDOR_PASSWORD" /bin/bash -s -- --no-dry-run --submit "$CENTRAL_MANAGER_NAME"
    ;;
  execute)
    curl -fsSL https://get.htcondor.org | GET_HTCONDOR_PASSWORD="$HTCONDOR_PASSWORD" /bin/bash -s -- --no-dry-run --execute "$CENTRAL_MANAGER"
    ;;
  *)
    echo "Rol inválido: $ROLE. Debe ser 'central-manager', 'submit' o 'execute'."
    exit 1
    ;;
esac