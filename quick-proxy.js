#!/usr/bin/env node

var pump = require('pump')
var r = require('axios');
var http = require('http');

const port = Number.parseInt(process.argv[2]);
const server = http.createServer(requestListener);
const baseUrl = process.argv[3];
server.listen(port, "0.0.0.0", ()=> {
    console.log("Cool down, proxy is UP");
    console.log("Port:", port);
});
function requestListener(req, res) {
    const targetUrl = baseUrl + req.url;
    if(req.headers.host){
		delete req.headers.host;
	}
    const reqOptions = {
        url: targetUrl,
        method: req.method,
        headers: req.headers,
        responseType: 'stream',
        validateStatus: () => true
    }

    r(reqOptions)
    .then( function(proxyResponse){
        res.headers = proxyResponse.headers;
        res.statusCode = proxyResponse.status;
        pump( proxyResponse.data, res)
    })
    .catch( err => {
        if (err.response) {
            console.error(err);
        }
    })
}

