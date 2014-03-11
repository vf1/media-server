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
    
    var self = this,
        newReps = Underscore.filter(reps, function (rep1) {
            return !Underscore.find(self.repositories, function (rep2) {
                return this.isEqual(rep1, rep2);
            }, this);
        }, this);
    
    if (newReps.length > 0) {
        
        this.repositories.push.apply(
            this.repositories,
            newReps
        );

        this.setTimer();
    }

    this.emit('changed', this);
};

Repositories.prototype.remove = function (reps) {
    
    var changed = false;
    
    this.repositories = Underscore.filter(this.repositories, function (rep1) {

        var found = Underscore.find(reps, function (rep2) {
            return this.isEqual(rep1, rep2);
        }, this);
        
        changed = changed || found;
        
        return !found;
    }, this);
    
    if (changed) {
        this.setTimer();
    }

    this.emit('changed', this);
};

Repositories.prototype.isEqual = function (rep1, rep2) {
    return rep1.mountpath === rep2.mountpath && rep1.path === rep2.path && rep1.type === rep2.type;
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
    }, 2000);
};

Repositories.prototype.get = function (reps) {
    return this.repositories;
};

Repositories.prototype.getSettings = function (reps) {
    return Underscore.map(this.repositories, function (item) {
        return Underscore.pick(item, 'mountpath', 'path', 'type');
    });
};

Repositories.prototype.getUpnp = function () {
    
    var errors, result = Underscore.filter(
        Underscore.map(this.repositories, function (item) {
            delete item.error;
            try {
                switch (item.type) {
                case 'music':
                    return new MusicRepository(item.mountpath, item.path);
                case 'path':
                    return new PathRepository(item.mountpath, item.path);
                default:
                    errors = true;
                    item.error = 'Unknown repository type (' + item.type + ') ignored';
                    this.logger.warn(item.error);
                    break;
                }
            } catch (e) {
                errors = true;
                item.error = e.message;
                if (item.error.indexOf('ENOENT') !== -1) {
                    item.error = 'Path not found';
                }
                this.logger.error('Failed to create repository: ' + e.message);
            }
        }, this),
        function (item) {
            return item ? true : false;
        },
        this
    );
    
    if (errors) {
        this.emit('errors', this);
    }
    
    return result;
};

module.exports = Repositories;
