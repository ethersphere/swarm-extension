#!/bin/bash
SCRIPTS_DIR=$( dirname "$0" )

cd "$SCRIPTS_DIR/.."

cp -r -T library/build test/bzz-test-page/swarm
cp -r -T library/build test/bzz-test-page/local-storage/swarm
cp -r -T library/build test/bzz-test-page/jafar-page/swarm
cp -r -T library/build test/bzz-test-page/jinn-page/swarm
