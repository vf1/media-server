/**@jsx React.DOM   */
/*jslint node: true */
"use strict";

var React = require('react');

var LoggerRow = React.createClass({
    
    getClassName: function (level) {
        switch (level) {
        case 'silly':
        case 'debug':
            return 'info';
        case 'verbose':
        case 'info':
            break;
        case 'warn':
            return 'warning';
        case 'error':
            return 'danger';
        }
        return '';
    },
    
    shouldComponentUpdate: function (nextProps, nextState) {
        
        return this.props.level !== nextProps.level ||
            this.props.message !== nextProps.message ||
            this.props.timestamp !== nextProps.timestamp;
    },

    render: function () {
    
        /*jslint white: true */
        return (
            <tr className={this.getClassName(this.props.level)}>
                <td>{this.props.message}</td>
                <td>
                    <small className='log-time'>{
                                this.props.timestamp.toLocaleDateString("en-us", { month: "short" }) + ' ' + 
                                this.props.timestamp.getDate() + ' ' + 
                                this.props.timestamp.toLocaleTimeString()
                            }
                    </small>
                </td>
            </tr>
        );
    }
    
    });

module.exports = LoggerRow;
