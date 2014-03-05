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
