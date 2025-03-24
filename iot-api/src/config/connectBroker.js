import mqtt from 'mqtt'
import {
    handleUpdateDate
} from '../controllers/controller'
// import { clientSockets, io } from '../server';
// const {sendDataToDevice, users, devices } = require('../server');
const { getUsers, getDevices, sendDataToDevice } = require('../server');


// import { sendDataToDevice, users } from '../server';
export const userClients = {};

export const connectUser = (deviceId) => {
    const client = mqtt.connect('mqtt://***.***.***.***'); // điền IP server broker đang chạy
    // mqtt://192.168.63.114
    let mqttData = null
    let data = null
    let type = null
    client.on('connect', () => {
        console.log(`${deviceId} connected to MQTT broker`);
        client.subscribe(`${deviceId}/data/+`, (err) => {
            if (err) {
                console.error(`${deviceId} subscription error:`, err);
            }
        });
    });

    client.on('message', (topic, message) => {
        const users = getUsers();
        const devices = getDevices();
        console.log(`${deviceId} received message on ${topic}: ${message.toString()}`);
        const now = new Date();

        const time = now.toLocaleTimeString();
        const date = now.toLocaleDateString();

        type = topic.split('/').pop();

        mqttData = {
            a: message.toString(),
            deviceId: deviceId,
            time: time,
            date: date
        }
        data = {
            type: type,
            mqttData: mqttData
        }
        console.log('ĐÂY LÀ BÊN BROKER NÈEEEEEEEEEEE: ', users)
        console.log('ĐÂY LÀ BÊN BROKER NÈEEEEEEEEEEE: ', devices)

        const user = users[devices[deviceId].userId]


        // lưu data vào db
        if (type !== "switch" && type !== "led" && type !== "toggle") handleUpdateDate(data)
        // truyền data tới client, lấy device hiện tại đang đc hiển thị trên web
        // console.log('DEVICE HIEN TAI DAY NE NÊNNENEENE: ', user.deviceId, deviceId)
        if (user.deviceId === deviceId) sendDataToDevice(user.userId, user.deviceId, data);
        console.log(data);
    });

    userClients[deviceId] = client;
}

export const publishToTopic = (deviceId, subTopic, message) => {
    const client = userClients[deviceId];
    if (client) {
        const topic = `${deviceId}/${subTopic}`;
        client.publish(topic, message, (err) => {
            if (err) {
                console.error(`Publish error for user ${deviceId} on topic ${topic}:`, err);
            } else {
                console.log(`Message published to ${topic} for user ${deviceId}: ${message}`);
            }
        });
    } else {
        console.error(`Client not found for user ${deviceId}. Please ensure the user is connected.`);
    }
}