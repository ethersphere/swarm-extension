#!/bin/bash
# sleep 20

if [[ -z "${BEE_STAMP}" ]]; then
  BEE_STAMP=`curl -s -XPOST http://127.0.0.1:1635/stamps/1/20 | cut -c 13-76`
fi

echo $BEE_STAMP
