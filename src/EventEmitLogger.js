/*jslint node: true */
"use strict";

var util = require('util');
var winston = require('winston');
var winstonCommon = require('winston/lib/winston/common.js');

var EventEmitLogger = winston.transports.EventEmitLogger = function (options) {
    
    winston.Transport.call(this, options);
    
    options = options || {};
    
    this.level = options.level || 'silly';
    this.eventType = options.eventType || 'log-single';
    this.emitter = options.emitter;
};

util.inherits(EventEmitLogger, winston.Transport);

EventEmitLogger.prototype.name = 'EventEmitterLogger';

EventEmitLogger.prototype.log = function (level, msg, meta, callback) {

    if (this.silent) {
        return callback(null, true);
    }
    
    try {
        this.emitter.emit(this.eventType, {
            level: level,
            message: EventEmitLogger.getMessage(msg, meta),
            timestamp: new Date().toISOString()
        });
    } catch (ex) {
        return callback(ex.message, false);
    }

    callback(null, true);
};

EventEmitLogger.getMessage = function (msg, meta) {

    return winstonCommon.log({
        level: 'X',
        message: msg,
        meta: meta,
        colorize: false,
        timestamp: false
    }).slice(3);
};

EventEmitLogger.prepare = function (items) {
    
    var i, meta, result = [];
    for (i = 0; i < items.length; i += 1) {
        
        if (typeof items[i].meta === 'undefined') {
            meta = JSON.parse(JSON.stringify(items[i]));

            delete meta.level;
            delete meta.message;
            delete meta.timestamp;
        }
        
        result.push({
            level: items[i].level,
            message: this.getMessage(items[i].message, items[i].meta || meta),
            timestamp: items[i].timestamp
        });
    }

    return result;
};

module.exports = EventEmitLogger;
