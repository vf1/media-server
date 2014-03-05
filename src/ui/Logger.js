/**@jsx React.DOM   */
/*jslint node: true */
/*global $ */
"use strict";

var React = require('react');
var ListenerMixin = require('./ListenerMixin');

var Logger = React.createClass({

    mixins: [ListenerMixin],
    
    getInitialState: function () {
        return {records: []};
    },
    
    onEventBulk: function (data) {
        var i;
        for (i = 0; i < data.length; i += 1) {
            data[i].timestamp = new Date(data[i].timestamp);
        }

        this.setState({ records: data.concat(this.state.records) });

        this.scrollBottom();
    },

    onEventSingle: function (data) {
        data.timestamp = new Date(data.timestamp);
        this.setState({ records: this.state.records.concat(data) });

        this.scrollBottom();
    },

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
    
//    componentDidMount: function () {
//        var resizeTable = function() {
//            var height = $(window).height() - 500;
//            console.log(height);
//            if (height < 100)
//                height = 100;
//            $('.log-table22').height(height);
//        };
//        
//        resizeTable();
//            
//        $(window).resize(resizeTable);
//    },
    
    scrollBottom: function () {
        
        if (this.scrollTimer) {
            clearTimeout(this.scrollTimer);
            this.scrollTimer = null;
        }
        
        var self = this;
        this.scrollTimer = setTimeout(function () {
            $(".log-table").animate({scrollTop: $(".log-table")[0].scrollHeight}, 1000);
            this.scrollTimer = null;
        }, 1000);
    },
    
    render: function () {
        
        /*jslint white: true */
        if (this.state.records.length === 0) {
            return (
                <div>
                    <p>No messages</p>
                </div>
            );
        } else {
            var list = this.state.records.map(function (record, index) {
                    return (
                        <tr className={this.getClassName(record.level)} key={index}>
                            <td>{record.message}</td>
                            <td>
                                <small className='log-time'>{
                                            record.timestamp.toLocaleDateString("en-us", { month: "short" }) + ' ' + 
                                            record.timestamp.getDate() + ' ' + 
                                            record.timestamp.toLocaleTimeString()
                                        }
                                </small>
                            </td>
                        </tr>
                    );
                }, this);

            return (
                <div className='log-table'>
                    <table className='table table-condensed table-hover'>
                        <thead>
                            <tr><th>Message</th><th>Timestamp</th></tr>
                        </thead>
                        <tbody>
                            {list}
                        </tbody>
                    </table>
                </div>
            );
        }
    }
    });

module.exports = Logger;