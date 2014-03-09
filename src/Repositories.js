/*jslint node: true */
"use strict";

var util = require("util");
var events = require("events");
var Underscore = require("underscore");
var PathRepository  = require('upnpserver').PathRepository;
var MusicRepository = require('upnpserver').MusicRepository;

function Repositories(repositories, logger) {
    
    this.repositories = repositories;
    this.logger = logger;
}

util.inherits(Repositories, events.EventEmitter);

Repositories.prototype.add = function (reps) {
    
    var self = this;
    
    this.repositories.push.apply(
        this.repositories,
        Underscore.filter(reps, function (rep1) {
            return !Underscore.find(self.repositories, function (rep2) {
                return Underscore.isEqual(rep1, rep2);
            });
        })
    );
    
    this.emit('changed', this);
    this.setTimer();
};

Repositories.prototype.remove = function (reps) {
    
    this.repositories = Underscore.filter(this.repositories, function (rep1) {
        return !Underscore.find(reps, function (rep2) {
            return Underscore.isEqual(rep1, rep2);
        });
    });
    
    this.emit('changed', this);
    this.setTimer();
};

Repositories.prototype.setTimer = function () {
    
    if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
    }
    
    var self = this;
    this.timer = setTimeout(function () {
        self.emit('delayed-changed', self);
        self.timer = null;
    }, 5000);
};

Repositories.prototype.get = function (reps) {
    return this.repositories;
};

Repositories.prototype.getUpnp = function () {
    
    return Underscore.filter(
        Underscore.map(this.repositories, function (item) {
            try {
                switch (item.type) {
                case 'music':
                    return new MusicRepository(item.mountpath, item.path);
                case 'path':
                    return new PathRepository(item.mountpath, item.path);
                default:
                    this.logger.warn('Unknown repository type (' + item.type + ') ignored');
                    break;
                }
            } catch (e) {
                this.logger.error('Failed to create repository: ' + e.message);
            }
        }, this),
        function (item) {
            return item ? true : false;
        },
        this
    );
};

module.exports = Repositories;
