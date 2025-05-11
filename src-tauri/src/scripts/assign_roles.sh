#!/bin/bash
source ../.env
for entry in "$@"; do
  NODE_IP=$(echo $entry | cut -d':' -f1)
  ROLE=$(echo $entry | cut -d':' -f2)

  echo "Asignando rol '$ROLE' al nodo '$NODE_IP'"

  case "$ROLE" in
    "cm")
      bash ./install_cm.sh $NODE_IP
      ;;
    "sub")
      bash ./install_sub.sh $NODE_IP
      ;;
    "exe")
      bash ./install_exe.sh $NODE_IP
      ;;
    *)
      echo "Rol desconocido: $ROLE"
      ;;
  esac
done
