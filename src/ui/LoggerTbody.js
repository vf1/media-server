/**@jsx React.DOM   */
/*jslint node: true */
"use strict";

var React = require('react');
var LoggerRow = require('./LoggerRow');

var LoggerTbody = React.createClass({
    
    shouldComponentUpdate: function (nextProps, nextState) {

        return nextProps.changed ||
            this.props.startIndex !== nextProps.startIndex ||
            this.props.endIndex !== nextProps.endIndex;
    },

    render: function () {
        /*jslint white: true, newcap: true */

        var i,
            rows = [];
        
        for (i = this.props.startIndex; i <= this.props.endIndex; i += 1) {
            rows.push(
                <LoggerRow
                        level={this.props.records[i].level}
                        message={this.props.records[i].message}
                        timestamp={this.props.records[i].timestamp}
                        key={i} />
            );
        }

        return (
            <tbody>
                {rows}
            </tbody>
        );
    }

    });

module.exports = LoggerTbody;
