var http = require('http');
var fs = require('fs');
var qs = require('querystring');

var browserCon = null;

var pings = Object();
var pingSchema = /^\d+-\d+-\d+-\d+-\d+-\d+-\d+-\d+-\d+-\d+-\d+-\d+-\d+-\d+-\d+-\d+-\d+-\d+-\d+-\d+$/;

var handlePingRequest = function () {
    if (!browserCon) {
        return;
    }

    var ping = '';
    for (ping in pings) break;

    if (ping == '') {
        return;
    }

    browserCon.end(ping);
};

var handlePongResponse = function (ping, pong) {
    if (!pings[ping]) {
        return;
    }

    pings[ping].end('{"status":"ok","ping":"' + ping + '","pong":"' + pong + '"}');
    delete pings[ping];
};

var api = http.createServer();
api.on('request', function (req, res) {
    var ping = req.url.substr(1);

    if (!pingSchema.test(ping)) {
        res.end('{"status":"error","error":"invalid ping"}');
        return;
    }

    pings[ping] = res;

    handlePingRequest();
});
api.listen(8080);


var browser = http.createServer();
browser.on('request', function (req, res) {
    browserCon = res;

    switch (req.url) {
        case '/data/browser.html':
            fs.createReadStream('./browser.html').pipe(res);
            break;
        case '/data/player.swf':
            fs.createReadStream('./player.swf').pipe(res);
            break;
        case '/favicon.ico':
            res.end();
            break;
        case '/ping':
            handlePingRequest();
            break;
        case '/pong':
            var reqBody = '';
            req.on('data', function (data) {
                reqBody += data;
            });

            req.on('end', function () {
                var reqPostData = qs.parse(reqBody);

                handlePongResponse(reqPostData.ping, reqPostData.pong);

                res.end();
            });
            break;
    }
});
browser.listen(8081);