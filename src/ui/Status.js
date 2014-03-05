/**@jsx React.DOM   */
/*jslint node: true */
"use strict";

var React = require('react');
var ListenerMixin = require('./ListenerMixin');

var Status = React.createClass({

    mixins: [ListenerMixin],
    
    getInitialState: function () {
        return { status: 'unknown' };
    },
    
    onEvent: function (data) {
        this.setState({ status: data });
    },

    render: function () {
        /*jslint white: true */
        return (
            <span className={'status status-' + this.state.status}>{this.state.status.charAt(0).toUpperCase() + this.state.status.slice(1)}</span>
        );
    }

    });

module.exports = Status;