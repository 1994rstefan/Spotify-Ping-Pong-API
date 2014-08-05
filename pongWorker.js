var queue = {};
var workers = [];
var ws = require('ws').Server;

var log = function (msg, workerId) {
    if (typeof workerId === 'undefined') {
        workerId = '-';
    }
    var now = new Date();
    console.log(now.toGMTString() + ' - ' + msg + ' (' + workerId + ')');
};

var wss = new ws({host: '127.0.0.1', port: 8081});
wss.on('connection', function (ws) {
    var workerId = (workers.push(ws) - 1);
    log('New worker', workerId);

    ws.on('close', function () {
        log('Worker closed', workerId);
        workers.splice(workerId, 1);
    });

    ws.on('message', function (msg) {
        log('Worker response', workerId);

        var msgParts = msg.split(':');
        var ping = msgParts[0];
        var pong = msgParts[1];

        if (typeof queue[ping] === 'function') {
            if (pong === '') {
                log('201 - Worker response (error) "' + msg + '"', workerId);
                queue[ping](201, null);
            } else {
                log('Worker response (OK) "' + msg + '"', workerId);
                queue[ping](null, pong);
            }
        }

        delete queue[ping];
    });
});


var lastWorkerId = 0;
module.exports.process = function (ping, cb) {
    log('workerProcess(' + ping + ', cb)');
    if (typeof cb !== 'function') {
        log('cb not a function');
        return;
    }

    if (workers.length === 0) {
        log('203 - no available workers');
        cb(203, null);
        return;
    }

    if (queue[ping]) {
        log('290 - ping already in queue');
        queue[ping](290, null);
    }

    queue[ping] = cb;

    lastWorkerId++;
    if (lastWorkerId >= workers.length) {
        lastWorkerId = 0;
    }

    try {
        workers[lastWorkerId].send(ping);
    }
    catch (e) {
        log('291 - error sending ping', lastWorkerId);
        cb(291, null);
    }
};