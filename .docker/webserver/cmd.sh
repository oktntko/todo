#!/bin/bash

# Start nginx process
nginx -g "daemon off;" &
PROCESS_NGINX=$!
# Start pm2 process
pm2-runtime start ecosystem.config.js &
PROCESS_PM2=$!

# Wait for any process to exit
wait $PROCESS_NGINX $PROCESS_PM2

# Exit with status of process that exited first
exit $?
