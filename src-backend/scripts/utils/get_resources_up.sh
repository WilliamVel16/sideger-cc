#!/bin/bash
LAN=$1
PASS=$2

echo $PASS |
sudo -S arp-scan --interface=$LAN --localnet | \
grep -v "(Unknown)" | \
grep -Eo '([0-9]{1,3}\.){3}[0-9]{1,3}'

#echo "$PASS" | \
#sudo -S