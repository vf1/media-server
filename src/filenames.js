/*jslint node: true */
"use strict";

var os = require('os');
var path = require('path');

function Filenames() {
    
    var isNodeWebkit = require('./node-webkit');
    
    this.logpath = isNodeWebkit ? os.tmpdir() : './';
    this.log = path.join(this.logpath, 'media-server.log');
    this.exception = path.join(this.logpath, 'media-server-exception.log');
    this.options = isNodeWebkit ?
            path.join(path.dirname(process.execPath), 'media-server.options') : './media-server.options';
}

module.exports = new Filenames();
