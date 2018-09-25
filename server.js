// index.js
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var cfenv = require('cfenv');
var io = require('socket.io')(server, {
    wsEngine: 'ws'
});


var Client = require('ibmiotf');


const appClientConfig = {
    "org": "3paps6",
    "id": 'MyAppIdDevice',
    "auth-key": 'a-3paps6-kbsd4zrore',
    "auth-token": 'n5uZXahyNbbrIF4m_3',
    "type": "shared"
};


const appClient = new Client.IotfApplication(appClientConfig);

// io.emit("TEST", "TEST");
// io.on('connection', function (socket) {
//     io.emit('hi', 'hi');
//     console.log('envoieeeeeeeee');
// });
appClient.connect();

//setting the log level to 'trace'
appClient.log.setLevel('debug');

appClient.on("connect", function () {
    /**
     * 1er paramètre correspod au au deviceType
     * 2ème paramètre : deviceId
     * 3ème paramètre : event 
     * 4ème paramètre : format du message
     */
    appClient.subscribeToDeviceEvents("+", "+", "+", "json");
});

appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {
    console.log("Device Event from :: " + deviceType + " : " + deviceId + " of event " + eventType + " with payload : " + payload);
    if (deviceType == "5b9a2a6b0499f57db5ce564e") {
        var payloadFinal = JSON.parse(payload);
        if (payloadFinal.data.substring(0, 2) === "43") {
            console.log('ttt', payloadFinal.time);
            payloadFinal.time = new Date(parseInt(payloadFinal.time) * Math.pow(10, 3) + 7200000).toUTCString();
            console.log("data", payloadFinal.data);
            data = parseInt(payloadFinal.data.substring(12, 16), 16) % 10;
            console.log('data', data);
            payloadFinal.data = data.toString();
            console.log('newpayld', payloadFinal);
            io.emit('deviceTemp', payloadFinal)
        } else {
            console.log("it's wrong type of data");
        }

    } else {
        console.log("capteur contact");
    }
    //io.emit('deviceTemp', JSON.parse(payload)); TODO decomment if you want to send it to the front
});

var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
server.listen(appEnv.port, function () {
    // print a message when the server starts listening
    console.log("server starting on port: " + appEnv.port);
});