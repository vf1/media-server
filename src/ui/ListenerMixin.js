/**@jsx React.DOM   */
/*jslint node: true */
"use strict";

var ListenerMixin = {
    
    listeners: null,

    unsubscribe: function () {
        var prop;
        for (prop in this.props) {
            if (this.props.hasOwnProperty(prop) && prop.indexOf('event') !== -1) {
                this.props.emitter.removeListener(this.props[prop], this.listeners[prop]);
            }
        }
        this.listeners = null;
    },
    
    makeHandler: function (prop) {
        
        var i, words,
            name = '',
            self = this;
        
        words = prop.split('-');
        for (i = 0; i < words.length; i += 1) {
            name += words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
        
        return function (data) {
            self['on' + name].call(self, data);
        };
    },

    subscribe: function (data) {
        this.listeners = {};
        
        var prop;
        for (prop in this.props) {
            if (this.props.hasOwnProperty(prop) && prop.indexOf('event') !== -1) {
                this.listeners[prop] = this.makeHandler(prop);
                data.emitter.on(this.props[prop], this.listeners[prop]);
            }
        }
    },

    componentDidMount: function () {
        this.subscribe(this.props);
    },

    componentWillUnmount: function () {
        this.unsubscribe();
    },

    componentWillReceiveProps: function (nextProps) {
        this.unsubscribe();
        this.subscribe(nextProps);
    }
};

module.exports = ListenerMixin;