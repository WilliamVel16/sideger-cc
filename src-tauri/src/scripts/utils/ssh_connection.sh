#!/bin/bash

USER=$1
PASS=$2
IP=$3

sshpass -p "$PASS" ssh-copy-id -o StrictHostKeyChecking=no "$USER@$IP"