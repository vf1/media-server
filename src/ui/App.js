/**@jsx React.DOM   */
/*jslint node: true */
"use strict";

var React       = require('react');
var ReactMount  = require('react/lib/ReactMount');
var ReactAsync  = require('react-async');
var Router      = require('react-router-component');

var Locations   = Router.Locations;
var Location    = Router.Location;
var NotFound    = Router.NotFound;

var Admin       = require('./Admin');

var NodeWebkitMixin = require('./NodeWebkitMixin');

//ReactMount.allowFullPageRender = true;

var App = React.createClass({
    
    onClick: function (e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            this.refs.router.navigate(e.target.attributes.href.value);
        }
    },
    
    wrap: function (markup) {
        return Admin.wrap(markup);
    },
    
    render: function () {
//        /*jslint newcap: true */
//        if (this.props.path === '/') {
//            return Admin();
//        }
//        throw 'not-found';

        /*jslint white: true, newcap: true */
        return (
            <Locations ref="router" /* onClick={this.onClick} */ path={this.props.path}>
                <Location path="/" handler={Admin} />
            </Locations>
        );
    }
    });

module.exports = App;

/*global window, document */
if (typeof window !== 'undefined') {
    /*jslint newcap: true */
    window.onload = function () {
        React.renderComponent(App(), document.body);
    };
}

//if (typeof window !== 'undefined') {
//    window.onload = function () {
//        ReactAsync.renderComponent(App(), document.body);
//    };
//}

var hasOption = function (args, option) {
    
    var i;
    for (i = 0; i < args.length; i += 1) {
        if (args[i].indexOf(option) !== -1 && args[i].length === option.length) {
            return true;
        }
    }
    
    return false;
};

var tray, nw = NodeWebkitMixin.getNw();
if (nw) {
    
    var showWindow = function () {
        nw.window.show();
        nw.window.focus();
    };

    nw.gui.App.on('open', function (cmdline) {

        if (hasOption(cmdline.split(' ').slice(1), '--hide') === false) {
            showWindow();
        }
    });

    if (hasOption(nw.gui.App.argv, '--hide') === false) {
        showWindow();
    }

    var menu = new nw.gui.Menu();
    menu.append(new nw.gui.MenuItem({ label: 'Show', click: showWindow }));

    tray = new nw.gui.Tray({
        title: 'Open Media Server',
        icon: './public/icons/main16.png',
        menu: menu
    });
    tray.on('click', showWindow);
}
