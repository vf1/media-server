/**@jsx React.DOM   */
/*jslint node: true */
"use strict";

var React = require('react');
var ListenerMixin = require('./ListenerMixin');

var Control = React.createClass({

    mixins: [ListenerMixin],
    
    getInitialState: function () {
        return { enabled: false };
    },
    
    onEvent: function (data) {
        if (data === this.props.enabledon) {
            this.setState({ enabled: true });
        }
    },
    
    onClick: function () {
            
        if (this.state.enabled) {
            
            this.setState({ enabled: false });

            this.props.emitter.emit('upnp-command', { 'command': this.props.command });
        }
    },

    render: function () {

        /* jshint ignore:start */
        return (
            <button type="button" 
                className={'btn btn-default' + (this.props.type ? (' btn-' + this.props.type) : '') + (this.state.enabled ? '' : ' disabled')}
                onClick={this.onClick} ref="button">
                        {this.props.children}
            </button>
        );
        /* jshint ignore:end */
    }
});

module.exports = Control;