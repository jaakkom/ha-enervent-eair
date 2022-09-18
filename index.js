process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import io  from "socket.io-client" // Client for WS server in enervent.com
import registers from './registers.js' // Modbus register names
import mqtt from 'mqtt' // Data to homeassistant

const url = process.env.URL;
const serialNumber = process.env.SERIALNUMBER;
const pin = process.env.PIN;

//const httpserver = http.createServer(requestListener);
const client  = mqtt.connect(process.env.MQTT_SERVER, {
    clientId: process.env.MQTT_CLIENT_ID,
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS,
})


client.on('message', function (topic, message) {
    // Handle incomimng messages of MQTT (SWITCHES)
    console.log(message.toString())
})

client.on('error', function(error) {
    console.log('MQTT CLIENT ERROR')
    console.log(error)
})


const devId = process.env.DEVICE_ID
const baseTopic = process.env.MQTT_DISCOVERY_PREFIX + '/sensor/'
const stateTopic= baseTopic + devId




var mac = null
var dumpDone = false

var socket = io.connect(url);

socket.on("disconnect", () => {
    console.log('Disconnected')
}),
socket.on("connect", () => {
    console.log('Connected to ' + url)
    console.log('Using serial: ' + serialNumber + ' and pin: ' + pin)
}),
socket.on("error", (e) => {
    console.log('Error: ', e)
    socket.socket.reconnect();
}),
socket.on("message", (e) => {
    e = JSON.parse(e);
    handleMessage(e)
    
})


var publishedTopics = [];
var currentData = {};

function handleMessage(msg) {
  if(!mac) mac = msg.src
  if(msg.data.type == 'changes') {
    msg.data.registers.forEach((element, index) => {
        if(element in registers) {
            var registerValue = msg.data.data[index] / registers[element].multiplier
            var device_class = registers[element].deviceClass
            var unit_of_measurement = registers[element].unitOfMeasurement

            var symbol = registers[element].symbol.toLowerCase()
            var configTopic = stateTopic +'_' + symbol + '/config'
            var dataTopic = stateTopic +'_currentData/state'

            // publish MQTT Discovery configs to Home Assistant
            if(!publishedTopics.includes(configTopic)) {
                var publishHaConf = {
                    device_class,
                    name: registers[element].title, 
                    state_topic: dataTopic, 
                    unit_of_measurement, 
                    value_template: "{{ value_json." + symbol + "}}", 
                    unique_id: devId + '_' + symbol,
                    //device: {
                    //   manufacturer: "Enervent", 
                    //    name: process.env.DEVICE_MODEL,
                    //    identifiers: [devId]
                    //}, 
                    //json_attributes_topic: dataTopic
                } 

                console.log('PUBLISHING TOPIC', configTopic, publishHaConf);
                client.publish(configTopic, JSON.stringify(publishHaConf, function(key, value) {
                    if(value!==undefined) return value
                }))
            }

            currentData[symbol] = registerValue
            // console.debug("PUBLISHING DATA", dataTopic, currentData)
            client.publish(dataTopic, JSON.stringify(currentData))

            if(!dumpDone) {
                var dumpCMD = {type: "ucp",dst: mac, data:{type: "command",device: mac,command: "dump"}}
                sendMessage(dumpCMD)
                dumpDone = true
            }
        }
    });
  } else {
    console.log(msg)
  }
}

function sendMessage(msg) {
    socket.send(JSON.stringify(msg))

}


var loginCMD = { type: "backend", data: { type: "auth", cmd: "loginWithPin", serialnumber: serialNumber, pin: pin }}
sendMessage(loginCMD)
