#!/bin/sh
set -e
if [ "$1" = 'start' ]; then
    shift
    echo "Starting application..."
    exec npm start $@
else
    echo "Executing [$@]"
    exec "$@"
fi



