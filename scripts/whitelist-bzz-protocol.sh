#!/bin/bash

sudo echo '{ "URLWhitelist": ["bzz://*"] }' |sudo tee /etc/opt/chrome/policies/managed/whitelist.json
