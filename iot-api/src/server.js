import express from 'express'
import bodyParser from 'body-parser'
import viewEngine from './config/viewEngine'
import initWebRouter from './route/web'
import connectDB from './config/connectDB'
import { userClients, connectUser, publishToTopic } from './config/connectBroker'
import http from 'http'  // Thêm http module
import socketIo from 'socket.io'  // Thêm socket.io module
require('dotenv').config()
import mqtt from 'mqtt'



let cors = require('cors')
let app = express()
let server = http.createServer(app)  // Tạo server HTTP từ Express app
let io = socketIo(server, {
    cors: {
        origin: process.env.URL_REACT || "http://localhost:3000", // Đổi thành URL React của bạn
        methods: ["GET", "POST"], // Phương thức được phép
        allowedHeaders: ["X-Requested-With", "content-type"], // Các header được phép
        credentials: true, // Cho phép gửi cookie hoặc thông tin xác thực
    },
})  // Khởi tạo socket.io server


let port = process.env.PORT || 8080
const users = {};
const devices = {};

// const clientStatuses = Object.keys(clientSockets).reduce((acc, deviceId) => {
//   acc[deviceId] = clientSockets[deviceId].connected; // Trạng thái kết nối của mỗi client
//   return acc;
// }, {});
// Cấu hình CORS
app.use(cors())
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', process.env.URL_REACT)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
    res.setHeader('Access-Control-Allow-Credentials', true)
    next()
})

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

viewEngine(app)
initWebRouter(app)

connectDB()

export function sendDataToDevice(userId, deviceId, data) {
    if (users[userId].socket) {
        users[userId].socket.emit('device:data', { deviceId, data }); // Gửi dữ liệu đến deviceId tương ứng
    } else {
        console.error(`Socket for user ${userId} noyt found`);
    }
}

// Tạo một client chung để theo dõi trạng thái của các thiết bị
const statusClient = mqtt.connect('mqtt://***.***.***.***'); // điền IP server broker đang chạy

statusClient.on('connect', () => {
    console.log("Status client connected to broker");
    // Đăng ký nhận thông tin từ tất cả các topic trạng thái của thiết bị
    statusClient.subscribe('devices/+/status', (err) => {
        if (err) {
            console.error('Failed to subscribe to status topics:', err);
        } else {
            console.log('Subscribed to devices/+/status');
        }
    });
});

// Xử lý khi nhận được thông tin trạng thái từ thiết bị
statusClient.on('message', (topic, message) => {
    const deviceId = topic.split('/')[1]; // Lấy deviceId từ topic
    const status = message.toString();

    // devices[deviceId] = { status };

    console.log(`Received status for device ${deviceId}: ${status}`);
    
    let userId = null
    if(devices[deviceId] && Object.keys(devices[deviceId]).length === 2) userId = devices[deviceId].userId;
    else devices[deviceId] = {status};
    // Kiểm tra trạng thái của thiết bị và cập nhật vào userClients
    if (status === 'offline') {
        // Nếu thiết bị offline, ngắt kết nối với client MQTT riêng của thiết bị
        if (userClients[deviceId]) {
            userClients[deviceId].end();
            console.log(`Device ${deviceId} disconnected.`);
            delete userClients[deviceId];
        }
        console.log(users[userId])
        // Gửi thông báo qua WebSocket cho các client
        if (userId && users[userId].socket) {
            users[userId].socket.emit('device:status', { deviceId, status: 'offline' });
        }
    } else if (status === 'online') {
        // Nếu thiết bị online, kết nối lại với client riêng
        if (!userClients[deviceId]) {
            connectUser(deviceId); // Tạo client mới khi thiết bị kết nối
            console.log('new connect', deviceId)
        }
        
        if (userId && users[userId].socket) {
            users[userId].socket.emit('device:status', { deviceId, status: 'online' });
        }
    }
    console.log('test:: ', devices)
});


// Thiết lập sự kiện khi một client kết nối WebSocket
io.on('connection', (socket) => {
    console.log('A new WebSocket client connected')

    const user = JSON.parse(socket.handshake.query.user);
    const userId = user.userId; // Giả sử deviceId được gửi trong query
    console.log(user.userId);
    // Lưu socket vào đối tượng clientSockets
    // clientSockets[userId] = socket;

    //lấy trạng thái các devices của user này
    Object.keys(user.devicesOfUser).forEach(deviceId => {
        if (!devices[deviceId]) {
            devices[deviceId] = { status: 'offline', userId : user.userId }; // Gán trạng thái mặc định là 'offline'
        } else {
            user.devicesOfUser[deviceId].status = devices[deviceId].status; // Lấy đối tượng tương ứng với deviceId
            devices[deviceId].userId = user.userId
        }
    });
    console.log('xem đã thay đổi đc device chưa', devices)
    // Lắng nghe sự kiện từ client
    socket.on('message', (msg) => {
        console.log('Received message:', msg)
        publishToTopic(msg.deviceId, msg.topic, msg.data);
        // Gửi lại thông điệp cho client (echo message)
        // socket.emit('message', `Echo: ${msg}`)
    })

    socket.on('change-device', (msg) => {
        console.log('Received change-device:', msg)
        console.log("KKKKKKKKKKKKKKKKKKKKKKK", msg)
        // sửa lại deviceId
        users[userId].deviceId = msg.deviceId

    })

    // Khi client ngắt kết nối
    socket.on('disconnect', () => {
        console.log('A client disconnected')
        delete users[user.userId].socket;
    })

    users[userId] = user
    users[userId].deviceId = user.deviceId
    users[userId].socket = socket
    // console.log('đây là chỗ lưu socket nè:', users[userId])
    // Gửi danh sách trạng thái all devices hiện tại khi client mới kết nối
    socket.emit('message', { devicesOfUser: user.devicesOfUser })
})

// Bắt đầu server tại cổng đã chỉ định
server.listen(port, () => {
    console.log(`Server is running at: http://localhost:${port}`)
})


export function getUsers() {
    return users;
}

export function getDevices() {
    return devices;
}

module.exports = {
    getUsers,
    getDevices,
    sendDataToDevice,
    users,
    devices,
};