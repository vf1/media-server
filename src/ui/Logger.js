/**@jsx React.DOM   */
/*jslint node: true */
/*global $ */
"use strict";

var React = require('react');
var ListenerMixin = require('./ListenerMixin');

var LoggerTbody = require('./LoggerTbody');

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

        this.bigChanges = true;
        this.setState({ records: data.concat(this.state.records) });

        this.scrollBottom();
    },

    onEventSingle: function (data) {
        data.timestamp = new Date(data.timestamp);
        this.setState({ records: this.state.records.concat(data) });

        this.scrollBottom();
    },
    
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
    
    bigChanges: false,
    
    render: function () {
        
        /*jslint white: true, newcap: true */
        if (this.state.records.length === 0) {
            return (
                <div>
                    <p>No messages</p>
                </div>
            );
        } else {

            var i, count,
                tbodies = [];
                
            for (i = 0; i < this.state.records.length; i += 64) {
                tbodies.push(
                    <LoggerTbody
                            records={this.state.records}
                            startIndex={i}
                            endIndex={((i + 63) < this.state.records.length) ? (i + 63) : (this.state.records.length - 1)}
                            changed={this.bigChanges} 
                            key={i} />
                );
            }
            
            this.bigChanges = false;

            return (
                <div className='log-table'>
                    <table className='table table-condensed table-hover'>
                        <thead>
                            <tr><th>Message</th><th>Timestamp</th></tr>
                        </thead>
                        {tbodies}
                    </table>
                </div>
            );
        }
    }
    });

module.exports = Logger;