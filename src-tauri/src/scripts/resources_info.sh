#!/bin/bash
# hostname
HOSTNAME=$(hostname)

# os
OS=$(grep PRETTY_NAME /etc/os-release | cut -d= -f2 | tr -d '"')

# cpu
CPU=$(grep -m 1 "model name" /proc/cpuinfo | cut -d: -f2 | sed 's/^ //')

# ram en mb
RAM=$(grep MemTotal /proc/meminfo | awk '{printf "%.0f", $2 / 1024}')

# disk
DISKS=$(lsblk -d -o NAME,SIZE,TYPE | awk '$3 == "disk" {print $1 ":" $2}' | grep -vE '^loop|^sr' | \
awk -F: '{printf "{\"name\": \"%s\", \"size\": \"%s\"},", $1, $2}' | sed 's/,$//')

# gpu
GPU=$(lspci | grep -i vga | cut -d ":" -f3 | sed 's/^ //')

echo "{
\"hostname\": \"$HOSTNAME\",
\"os\": \"$OS\",
\"cpu\": \"$CPU\",
\"ram_mb\": $RAM,
\"disk\": [ $DISKS ],
\"gpu\": \"$GPU\"
}"