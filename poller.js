process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import io  from "socket.io-client"
import registers from './registers.js'
import mqtt from 'mqtt'


//const client  = mqtt.connect('mqtt://test.mosquitto.org')

var i  = 0;
var url = 'https://my.enervent.com';
var serialNumber = "Your123";
var pin = '1234';

var socket = io.connect(url);
var mac = null
var dumpDone = false
var currentData = {}
socket.on("disconnect", () => {
    console.log('Disconnected')
}),
socket.on("connect", () => {
    console.log('Connected to ' + url)
}),
socket.on("error", (e) => {
    console.log('Error: ', e)
    socket.socket.reconnect();
}),
socket.on("message", (e) => {
    e = JSON.parse(e);
    handleMessage(e)
    
})


function handleMessage(msg) {
  if(!mac) mac = msg.src
  if(msg.data.type == 'changes') {
    msg.data.registers.forEach((element, index) => {
        if(element in registers) {
            currentData[registers[element].symbol] = msg.data.data[index] / registers[element].multiplier
            console.debug(currentData);

            if(!dumpDone) {
                var dumpCMD = {type: "ucp",dst: mac, data:{type: "command",device: mac,command: "dump"}}
                sendMessage(dumpCMD)
                dumpDone = true
            }
        }
    });
  } 
}

function sendMessage(msg) {
    socket.send(JSON.stringify(msg))

}
var loginCMD = { type: "backend", data: { type: "auth", cmd: "loginWithPin", serialnumber: serialNumber, pin: pin }}
sendMessage(loginCMD)
