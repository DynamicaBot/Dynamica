#!/bin/sh

cd /home/container

PARSED=$(echo "${STARTUP}" | sed -e 's/{{/${/g' -e 's/}}/}/g' | eval echo "$(cat -)")

exec env ${PARSED}
