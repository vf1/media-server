Open Media Server
=================
This is an early version of UPNP/DLNA media server for Windows/Mac/Linux.


How to install and run
======================
The media server is available as pre built binaries or node-webkit application.

Version 0.1.0
-------------

* [Windows .zip](https://github.com/vf1/media-server/releases/download/v0.1.0/open-media-server-0.1.0-x86.zip)
* [Linux 32bit .tar.gz](https://github.com/vf1/media-server/releases/download/v0.1.0/open-media-server-0.1.0-ia32.tar.gz)
* [Linux 64bit .tar.gz](https://github.com/vf1/media-server/releases/download/v0.1.0/open-media-server-0.1.0-x64.tar.gz)
* [Node-Webkit .nw](https://github.com/vf1/media-server/releases/download/v0.1.0/open-media-server-0.1.0.nw)


Development
===========
The media server is [node js](http://nodejs.org/) application based on [upnpserver](https://github.com/oeuillot/upnpserver) powered by [node-webkit](https://github.com/rogerwang/node-webkit), [reactjs](https://reactjs.org) and other useful node-js modules.

    git clone https://github.com/vf1/media-server.git
    npm install
    flatten-packages

*The [flatten-packages](https://github.com/arifsetiawan/flatten) eliminates this [issue](http://stackoverflow.com/questions/13318364/how-to-deploy-node-js-application-with-deep-node-modules-structure-on-windows).*

Build node-webkit packages
--------------------------
Requires [python 2.7](http://www.python.org/) version 2.7 to run the script.

    nodewebkit.py
