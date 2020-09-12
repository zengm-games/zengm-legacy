#!/bin/bash

node_modules/.bin/electron-forge make "$@"

echo "The packages are in out/make/"
ls out/make/
