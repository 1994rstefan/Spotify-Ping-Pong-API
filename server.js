var fs = require('fs');
var http = require('http');
var pongWorker = require('./pongWorker.js');

var pingSchema = /^\d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+$/;

var api = http.createServer();
api.on('request', function (req, res) {
    var encodedPing = req.url.substr(1);
    var ping = encodedPing.replace(/-/g, ' ');
    
    res.setHeader('Content-type', 'application/json');

    if (!pingSchema.test(ping)) {
        res.end('{"status":201}');
        return;
    }


    pongWorker.process(ping, function (err, pong) {
        if (err) {
            res.end('{"status":' + err + '}');
            return;
        }

        var encodedPong = pong.replace(/ /g, '-');

        res.end('{"status":100,"ping":"' + encodedPing + '","pong":"' + encodedPong + '"}');
    });
});
api.listen(80);


var browser = http.createServer();
browser.on('request', function (req, res) {
    switch (req.url) {
        case '/worker.html':
            fs.createReadStream('./worker.html').pipe(res);
            break;
        case '/player.swf':
            fs.createReadStream('./player.swf').pipe(res);
            break;
        default:
            res.writeHead(404);
            res.end('404 - ' + http.STATUS_CODES[404]);
            break;
    }
});
browser.listen(8080, '127.0.0.1');
