#!/bin/bash
HOSTNAME=$(hostname)
IP=$(hostname -I | awk '{print $1}')
OS=$(grep PRETTY_NAME /etc/os-release | cut -d= -f2 | tr -d '"')
CPU=$(grep -m 1 "model name" /proc/cpuinfo | cut -d: -f2 | sed 's/^ //')
RAM=$(grep MemTotal /proc/meminfo | awk '{printf "%.0f", $2 / 1024}')
DISKS=$(lsblk -d -o NAME,SIZE,TYPE | awk '$3 == "disk" {print $1 ":" $2}' | grep -vE '^loop|^sr' | \
awk -F: '{printf "{\"name\": \"%s\", \"size\": \"%s\"},", $1, $2}' | sed 's/,$//')

#lspci is not installed on docker containers
if command -v lspci &> /dev/null; then
  GPU=$(lspci | grep -i vga | cut -d ":" -f3 | sed 's/^ //')
else
  GPU=""
fi

echo "{
\"hostname\": \"$HOSTNAME\",
\"ip\": \"$IP\",
\"os\": \"$OS\",
\"cpu\": \"$CPU\",
\"ram_mb\": $RAM,
\"disk\": [ $DISKS ],
\"gpu\": \"$GPU\"
}"