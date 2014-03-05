/*jslint node: true */
"use strict";

var url = require('url');

var UpnpMiddleware = function () {

    this.httpServer = null;
    this.upnpServer = null;
};

UpnpMiddleware.prototype.listen = function (httpServer, upnpServer) {

    this.httpServer = httpServer;
    this.upnpServer = upnpServer;

    this.oldListeners = httpServer.listeners('request').splice(0);
    this.httpServer.removeAllListeners('request');

    var self = this;
    this.httpServer.on('request', function (request, response) {
        self.requestHandler.call(self, request, response);
    });
};

UpnpMiddleware.prototype.requestHandler = function (request, response) {
    
    var self = this,
        path = url.parse(request.url).pathname;

    this.upnpServer.processRequest(request, response, path, function (error, processed) {
        if (error) {
            response.writeHead(500, 'Server error: ' + error);
            response.end();
            return;
        }
        if (!processed) {
            var i, l;
            for (i = 0, l = self.oldListeners.length; i < l; i += 1) {
                self.oldListeners[i].call(self.httpServer, request, response);
            }
            return;
        }
    });
};

UpnpMiddleware.prototype.getMiddleware = function (upnpServer) {

    var self = this;
    
    if (typeof (upnpServer) !== 'undefined') {
        this.upnpServer = upnpServer;
    }
    
    return function (request, response, next) {

        if (self.upnpServer) {
            
            var path = url.parse(request.url).pathname;

            self.upnpServer.processRequest(request, response, path, function (error, processed) {
                if (error) {
                    response.writeHead(500, 'Server error: ' + error);
                    response.end();
                    return;
                }
                if (!processed) {
                    next();
                    return;
                }
            });

        } else {
            
            next();
            return;
        }
    };
};

module.exports = new UpnpMiddleware();