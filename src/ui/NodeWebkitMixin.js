/**@jsx React.DOM   */
/*jslint node: true */
/*global window */
"use strict";

var NodeWebkitMixin = {
    
    isNodeWebkit: function () {
        return typeof window !== 'undefined' && window.nwDispatcher;
    },

    getNw: function () {
        if (this.isNodeWebkit()) {
            
            var gui = window.nwDispatcher.requireNwGui();
            
            return {
                gui: gui,
                window: gui.Window.get()
            };
        }
    },
    
    componentDidMount: function () {
        this.nw = this.getNw();
    }
};

module.exports = NodeWebkitMixin;