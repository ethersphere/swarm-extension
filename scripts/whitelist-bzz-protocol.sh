#!/bin/bash
mkdir -p /etc/opt/chrome/policies/managed
echo '{ "URLWhitelist": ["bzz://*"] }' |tee /etc/opt/chrome/policies/managed/whitelist.json
