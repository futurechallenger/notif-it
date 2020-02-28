#!/bin/sh

rm -rf ./views/build 

cd client
yarn install
yarn build
cd ../

# cp -r client/build build/client
cp -r client/build/ views
