#!/bin/sh

# copy files and build package.

cp -r icomoon/fonts ../css
cp icomoon/style.css ../compass/sass/icons.scss

compass compile ../compass

mkdir -p pmsc-player
rm -rf pmsc-player/*

cp ../*.php pmsc-player
cp -r ../css pmsc-player
cp -r ../js pmsc-player
cp -r ../swf pmsc-player

zip -r pmsc-player.zip pmsc-player

rm -rf pmsc-player
