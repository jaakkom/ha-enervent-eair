process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import io  from "socket.io-client" // Client for WS server in enervent.com
import registers from './registers.js' // Modbus register names
import mqtt from 'mqtt' // Data to homeassistant

import http from 'http' // Commands to enervent

//const httpserver = http.createServer(requestListener);
/*const client  = mqtt.connect(process.env.MQTT_SERVER, {
    clientId: process.env.MQTT_CLIENT_ID,
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASSWORD,
})

const devId = process.env.DEVICE_ID
const baseTopic = process.env.MQTT_DISCOVERY_PREFIX + '/sensor/'
const stateTopic= baseTopic + devId
const statusTopic = stateTopic + '_status'

const deviceConf = '"device": {"manufacturer": "Enervent", "name": "' + process.env.DEVICE_MODEL + '", "identifiers": ["' + devId + '"]}'
*/

// publish MQTT Discovery configs to Home Assistant
//var temperatureHaConf = '{"device_class": "temperature", "name": "Battery SOC", "state_topic": "' + stateTopic +'/state", "unit_of_measurement": "%", "value_template": "{{ value_json.soc}}", "unique_id": "' + devId + '_soc", ' + deviceConf + ', "json_attributes_topic": "' + statusTopic + '/state"}' 
//client.publish(STATE_TOPIC +'_soc/config', temperatureHaConf, 0, True)

//var humidityHaConf = '{"device_class": "humidity", "name": "Battery Voltage", "state_topic": "' + stateTopic +'/state", "unit_of_measurement": "V", "value_template": "{{ value_json.voltage}}", "unique_id": "' + devId + '_voltage", ' + deviceConf + '}'
//client.publish(STATE_TOPIC + '_voltage/config', voltageHaConf, 0, True)


//client.on('connect', function () {
//  client.subscribe('presence', function (err) {
 //   if (!err) {
  //    client.publish('presence', 'Hello mqtt')
   // }
 // })
//})


var i  = 0;
var url = process.env.URL;
var serialNumber = process.env.SERIALNUMBER;
var pin = process.env.PIN;

var socket = io.connect(url);
var mac = null
var dumpDone = false
var currentData = {}

// listen 8080 for incoming actions for controlling enervent
// httpserver.listen(8080);

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


// Http server is used for controlling Enervent
//const requestListener = function (req, res) {
//    res.writeHead(200);
//    res.end('Hello, World!');
//}




var loginCMD = { type: "backend", data: { type: "auth", cmd: "loginWithPin", serialnumber: serialNumber, pin: pin }}
sendMessage(loginCMD)
