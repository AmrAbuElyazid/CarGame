var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var jade = require('jade');

var port = 3000;

server.listen(port, '0.0.0.0', function () {
    var id = require('./helpers/randomstring')(3);
    var room = io.of('/' + id);

    var os = require('os');

    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }

    var ip = addresses[0];
    console.log(ip)
});

app.get('/', function (req, res, next) {
    var id = require('./helpers/randomstring')(3);
    var room = io.of('/' + id);

    var os = require('os');

    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }

    var ip = addresses[0];

    room.on('connection', function (socket) {
        var ready = false;

        socket.on('movement', function (data) {
            if (!ready) {
                room.emit('connected');
                ready = true;
            }

            room.emit('updateBall', data);
        });
    });
    
    try {
        res.send(jade.compileFile(__dirname + '/templates/game.jade')({
            id: id,
            ip: ip,
            title: 'Game',
            host: req.hostname,
            port: port
        }));
    } catch (e) {
        next(e)
    }
});

app.get('/:id', function (req, res, next) {
    try {
        res.send(jade.compileFile(__dirname + '/templates/controller.jade')({
            id: req.params.id,
            title: 'Controller',
            host: req.hostname,
            port: port
        }));
    } catch (e) {
        next(e)
    }
});

