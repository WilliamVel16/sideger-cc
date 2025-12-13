#!/bin/bash

CPU=$(nproc 2>/dev/null)
RAM=$(grep MemTotal /proc/meminfo | awk '{printf "%.0f", $2 / 1024}')

if [ -z "$CPU" ] || [ -z "$RAM" ]; then
  exit 1
fi

echo "{
  \"cpu\": $CPU,
  \"ram_mb\": $RAM
}"
