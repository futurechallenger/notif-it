#!/bin/sh

rm -rf build 
yarn build:server

cd client
yarn install
yarn build
cd ../

cp -r client/build build/client
