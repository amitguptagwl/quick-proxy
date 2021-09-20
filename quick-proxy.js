#!/usr/bin/env node

const pump = require('pump')
const r = require('axios');
const http = require('http');
const { random } = require('./util');

const logsDetail = process.argv.indexOf("--detail") !== -1
let delay = process.argv.indexOf("--delay");
if(delay){
    delay = process.argv[++delay];
}
const port = Number.parseInt(process.argv[2]);
const server = http.createServer(requestListener);
const baseUrl = process.argv[3];

server.listen(port, "0.0.0.0", ()=> {
    console.log("Cool down, proxy is UP");
    console.log("Port:", port);
});

function requestListener(req, res) {
    const reqId = random(12, 'alpha_num');
    const targetUrl = baseUrl + req.url;
    log(reqId + ": Request");
    console.log("→",reqId + ": " + req.method + " " + targetUrl);

    let body = [];
	req.on('error', function(err) {
		console.error(err);
	}).on('data', function(chunk) {
	    body.push(chunk);
	}).on('end', () => {
		body = Buffer.concat(body).toString();
        if(body) log(reqId + ": Payload: "+ body);

        const reqOptions = {
            url: targetUrl,
            data: body,
            method: req.method,
            headers: req.headers,
            responseType: 'stream',
            validateStatus: () => true,
        }
        delete reqOptions.headers["postman-token"];
        reqOptions.headers["host"] = (new URL(baseUrl)).hostname;
        //reqOptions.headers["accept-encoding"] = "";
        log("Headers used to make request", reqOptions.headers);

        setTimeout(() => {
            proxyReq(reqOptions, res, reqId);
        }, delay || 0);
    });

    
}

function proxyReq(reqOptions, res, reqId) {
    log(reqId + ": Response");
    r(reqOptions)
        .then(function (proxyResponse) {
            copyHeaders(proxyResponse, res);
            log("Headers:",  proxyResponse.headers);
            res.statusCode = proxyResponse.status;
            log(reqId + ": Status: " + proxyResponse.status);

            if (logsDetail) {

                let resBody = [];
                proxyResponse.data.on('error', function (err) {
                    console.error(err);
                }).on('data', function (chunk) {
                    resBody.push(chunk);
                    res.write(chunk);
                }).on('end', () => {
                    //resBody = Buffer.concat(resBody).toString();
                    res.end(null);
                    const strBody = Buffer.concat(resBody).toString();
                    if (proxyResponse.headers["content-type"] === "application/json") {
                        log(reqId + ": Response JSON Payload: " + JSON.stringify(JSON.parse(strBody), null, 4));
                    } else {
                        log(reqId + ": Response Payload: " + proxyResponse.data);
                    }
                });
            } else {
                pump(proxyResponse.data, res);
            }
        })
        .catch(err => {
            if (err.response) {
                console.error(err);
            }
        });
}

function copyHeaders(from,to){
    const headers = Object.keys(from.headers);
    for (let i = 0; i < headers.length; i++) {
        const val = from.headers[headers[i]];
        to.setHeader(headers[i], val);
    }
}
function log(){
    if(logsDetail){
        console.log(...arguments);
    }
}
