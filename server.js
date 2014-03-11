/*jslint node: true */
"use strict";

var winston = require('winston');
var filenames = require('./src/filenames');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ level: 'silly', colorize: true })
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({ colorize: true })
    ]
});


var nconf = require('nconf');

var nconfError;
try {
    nconf.file({ file: filenames.options });
} catch (e) {
    nconfError = 'Failed to load options: ' + e.message;
}

nconf.defaults({
    http: {
        port: 3000
    },
    files: filenames,
    repositories: []
});


logger.add(winston.transports.File, { level: 'silly', filename: nconf.get('files:log'), json: true});
logger.handleExceptions(new (winston.transports.File)({ filename: nconf.get('files:exception'), json: true }));


var startTime = Date.now();
logger.info('Starting...');
if (nconfError) {
    logger.error(nconfError);
}


var port = nconf.get('http:port');

var expressModule = require('express');
var express     = expressModule();
var httpServer  = require('http').createServer(express);
var io          = require('socket.io').listen(httpServer, { log: false });

var Underscore  = require('underscore');
var url         = require('url');
var reactify    = require('reactify');
var browserify  = require('connect-browserify');
var ReactAsync  = require('react-async');
var React       = require('react');
var SSDP        = require('node-ssdp');
var UPNPServer  = require('upnpserver').UPNPServer;
var upnpMiddleware = require('./src/UpnpMiddleware');
var repositories   = new (require('./src/Repositories'))(nconf.get('repositories'), logger);

var nodejsx     = require('node-jsx').install();
var reactApp    = require('./src/ui/App');

var debug = process.env.NODE_ENV !== 'production';

logger.extend(require('upnpserver').logger);

repositories.on('changed', function (sender) {

    nconf.set('repositories', sender.get());
    nconf.save();

    io.sockets.emit('repositories', sender.get());
});

repositories.on('errors', function (sender) {

    io.sockets.emit('repositories', sender.get());
});

repositories.on('delayed-changed', function (sender) {

    logger.info('Set repositories to UPNP server');
    upnpMiddleware.upnpServer.setRepositories(sender.getUpnp());
});

function reactMiddleware(req, res, next) {

    var markup, path = url.parse(req.url).pathname,
        app = reactApp({ path: path });
    
    try {
        markup = React.renderComponentToString(app);
        
        if (markup.length < 140) {
            return next();
        }
        
        res.send(app.wrap(markup));

    } catch (e) {
        return next(e);
    }
        
//    ReactAsync.renderComponentToStringWithAsyncState(app, function (err, markup) {
//
//        if (err || markup.length < 140) {
//            return next(err);
//        }
//        res.send(app.wrap(markup));
//    });
}

var EventEmitLogger = require('./src/EventEmitLogger');
logger.add(winston.transports.EventEmitLogger, { emitter: io.sockets });

var upnpStatus = 'stopped';
function setUpnpStatus(status) {
    upnpStatus = status;
    io.sockets.emit('upnp-status', upnpStatus);
}

var ssdpServer = null;

function startUpnp() {
    
    setUpnpStatus('starting');

    upnpMiddleware.upnpServer = new UPNPServer(port, { repositories: repositories.getUpnp() }, function (error, upnpServer) {

        if (error) {
            logger.error("Can not start UPNP server : ", error);
            setUpnpStatus('failed');
            return;
        }

        var seeItself = true,
            descURL = upnpServer.descriptionPath;
        
        if (descURL.charAt(0) === "/") {
            descURL = descURL.substring(1);
        }

        ssdpServer = new SSDP({
            logLevel : 'INFO',
            log : false,
            udn : upnpServer.uuid,
            description : descURL
        });

        ssdpServer.on('advertise-alive', function (heads) {
//            if (heads.USN.indexOf(upnpServer.uuid) === -1) {
//                logger.debug('SSDP: ',  heads);
//            } else if (seeItself) {
//                logger.info('Receive own SSDP, ', heads);
//                seeItself = false;
//            }
        });

        ssdpServer.on('advertise-bye', function (heads) {
//            if (heads.USN.indexOf(upnpServer.uuid) === -1) {
//                logger.debug('SSDP: ', heads);
//            }
        });

        ssdpServer.addUSN('upnp:rootdevice');
        ssdpServer.addUSN(upnpServer.type);

        upnpServer.services.forEach(function (service) {
            ssdpServer.addUSN(service.type);
        });

        ssdpServer.server('0.0.0.0', upnpServer.port);

        logger.info('UPNP started');
        setUpnpStatus('running');
    });
}

function stopUpnp() {

    if (upnpMiddleware.upnpServer) {
        
        ssdpServer.stop();
        ssdpServer = null;
        upnpMiddleware.upnpServer = null;

        logger.info('UPNP stoped');
        setUpnpStatus('stopped');
        
    } else {
        logger.info('UPNP was already stoped');
    }
}

io.sockets.on('connection', function (socket) {
    
    socket.emit('files', nconf.get('files'));
    socket.emit('repositories', repositories.get());
    socket.emit('upnp-status', upnpStatus);

    logger.query({
        from: startTime,
        until: Date.now(),
        transport: 'File',
        order: 'asc',
        limit: 1000
    }, function (error, results) {
        if (error) {
            logger.error('Failed to query log: ' + error.message);
        } else {
            socket.emit('log-bulk', EventEmitLogger.prepare(results));
        }
    });

    socket.on('upnp-command', function (command) {
        logger.info('Command: ' + JSON.stringify(command));
        
        switch (command.command) {
        case 'stop':
            stopUpnp();
            break;
        case 'start':
            startUpnp();
            break;
        case 'add-reps':
            repositories.add(command.list);
            break;
        case 'delete-reps':
            repositories.remove(command.list);
            break;
        }
    });
});

express.use('/static', expressModule['static']('./public'));
express.get('/bundle.js', browserify({ entry: './src/ui/App', debug: debug, watch: debug, transforms: [reactify] }));
//express.use(expressModule.logger());
express.use(reactMiddleware);
express.use(upnpMiddleware.getMiddleware());

httpServer.listen(port, function () {
    logger.info('http server started, http://localhost:' + port);
});

startUpnp();
