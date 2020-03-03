#!/bin/sh

rm -rf ./views 
mkdir ./views

cd client
yarn install
yarn build
cd ../

# cp -r client/build build/client
cp -r client/build/* views
cp -r resources/* views
makdir build/views
cp -r views/* build/views
