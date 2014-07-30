var http = require('http');
var fs   = require('fs');
var qs   = require('querystring');

var WebInterface = http.createServer();

var pings = Object();

WebInterface.on('request', function (req, res) {
    switch(req.url){
        case '/favicon.ico':
            res.end();
            break;
        case '/browser.html':
            fs.createReadStream('./browser.html').pipe(res);
            break;
        case '/player.swf':
            fs.createReadStream('./player.swf').pipe(res);
            break;
        case '/ping':
            var ping = '';
            for (ping in pings) break;
            res.end(ping);
            break;
        case '/pong':
            var reqBody = '';
            req.on('data', function(data){
                reqBody += data;
            });
            req.on('end', function(){
                var reqPostData = qs.parse(reqBody);
                pings[reqPostData.ping].end(reqPostData.pong);
                delete pings[reqPostData.ping];
                res.end();
            })
            break;
        default:
            var ping = req.url.substr(1);
            pings[ping] = res;
    }
});


WebInterface.listen(8080);