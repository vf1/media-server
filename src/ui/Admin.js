/**@jsx React.DOM   */
/*jslint node: true */
/*global $ */
"use strict";

var React       = require('react');

var Modal  = require('react-bootstrap/Modal');
var Button = require('react-bootstrap/Button');
var OverlayTriggerMixin = require('react-bootstrap/OverlayTriggerMixin');

var NodeWebkitMixin = require('./NodeWebkitMixin');

var Logger      = require('./Logger');
var Status      = require('./Status');
var Control     = require('./Control');
var Library     = require('./Library');

var io = require('socket.io-client');

var Admin = React.createClass({
    
    mixins: [
        OverlayTriggerMixin,
        NodeWebkitMixin
    ],

    getInitialState: function () {
        return this.getDefaultState();
    },
    
    getDefaultState: function (socketio, files) {
        
        return {
            socketio: socketio || {
                on: function () {},
                removeListener: function () {}
            },
            files: files || {
                log: '?',
                exception: '?'
            }
        };
    },

    componentDidMount: function () {
        
        var self = this,
            socketio = io.connect('http://localhost:3000');
        
        this.setState(this.getDefaultState(socketio));

        socketio.on('files', function (files) {
            self.setState(self.getDefaultState(socketio, files));
        });
        
        this.createAffix();
        
        if (this.nw) {
            this.nw.window.on('close', function () {
                self.setState({ wantClose: true });
            });
        }
    },
    
    createAffix: function () {
        var affix = $('#affix-nav').affix({
            offset: { top: 20 }
        });
        affix.width(affix.parent().width());

        $('body').scrollspy({ target: '#affix-nav', offset: 70 });
        $('#status').scrollspy();

        setInterval(function () {
            $('body').scrollspy('refresh');
        }, 5000);
    },

    statics: {
        wrap: function (markup) {
            return '<!DOCTYPE html>' +
                '<html lang="en">' +
                '<head>' +
                    '<link rel="stylesheet" href="/static/bootstrap-3.1.1/css/bootstrap.min.css" />' +
                    '<link rel="stylesheet" href="/static/screen.css" />' +
                '</head>' +
                '<body>' +
                    markup +
                    '<script src="/static/jquery-1.11.0.min.js"></script>' +
                    '<script src="/static/bootstrap-3.1.1/js/bootstrap.min.js"></script>' +
                    '<script src="/bundle.js"></script>' +
                '</body>' +
                '</html>';
        }
    },
    
    handleExit: function () {
        this.nw.window.close(true);
    },
    
    handleHide: function () {
        this.setState({ wantClose: false });
        this.nw.window.hide();
    },
    
    handleCancelExit: function () {
        this.setState({ wantClose: false });
    },
    
    renderOverlay: function () {
        /*jslint white: true, newcap: true */
        if (this.state.wantClose) {
            return (
                <Modal title="Exit or hide window" onRequestHide={this.handleCancelExit}>
                    <div className="modal-body">
                        Do you want to exit the application or hide the main window and continue working media server?
                    </div>
                    <div className="modal-footer">
                        <Button onClick={this.handleExit}>Exit</Button>
                        <Button bsStyle="primary" onClick={this.handleHide}>Hide window</Button>
                    </div>
                </Modal>
            );
        } else {
            return <span/>;
        }
    },

    render: function () {
        /*jslint white: true, newcap: true */
        return (
            <div className="spy-fix">
            
                <nav className="navbar navbar-default navbar-fixed-top" role="navigation">
                    <div className="container">
                        <div className="navbar-header">
                            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            </button>
                            <a className="navbar-brand" href="#">Open Media Server</a>
                        </div>
                        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        </div>
                    </div>
                </nav>

                <div className="container">
                    <div className="row">
                        <div className="col-sm-9">
                            <div id="status" className="section">
                                <h1 className='page-header'>Status</h1>
                                <p>Below is the status of the UPNP/DLNA server. Feel free to start/stop the server.</p>
                                <p>Server status: <Status emitter={this.state.socketio} event="upnp-status" /></p>
                                <div className="btngroup">
                                    <Control emitter={this.state.socketio} event="upnp-status" enabledon="stopped" command="start" type="success">Start server</Control>
                                    <Control emitter={this.state.socketio} event="upnp-status" enabledon="running" command="stop" type="danger">Stop server</Control>
                                </div>
                            </div>
                            <div id="library" className="section">
                                <h1 className='page-header'>Library</h1>
                                <p>The <i>mount path</i> is path to media data how it looks on UPNP/DLNA device. The <i>path</i> is path to folder with media data on computer that runs media server. There are two types of repository. The <i>path type</i> just mirrors files organization in selected folder. The <i>music type</i> organizes virtual folders by genres, albums and musicians by using meta data from mp3.</p>
                                <Library emitter={this.state.socketio} event="repositories" />
                            </div>
                            <div id="serverlog" className="section">
                                <h1 className='page-header'>Server Log</h1>
                                <p>The full log stored in <code>{this.state.files.log}</code> file, exceptions log in <code>{this.state.files.exception}</code> file.</p>
                                <Logger emitter={this.state.socketio} event-bulk="log-bulk" event-single="log-single" />
                            </div>
                            <br /><br />
                        </div>
                        <div className="col-sm-3">
                            <div id="affix-nav">
                                <ul className="nav nav-pills nav-stacked">
                                    <li><a href="#status">Status</a></li>
                                    <li><a href="#library">Library</a></li>
                                    <li><a href="#serverlog">Server Log</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            
            </div>
        );
    }
    });

module.exports = Admin;