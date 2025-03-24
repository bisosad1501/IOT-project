import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = ({ setAir, setLight, setSwitch, setLed, setToggle, deviceId, setDevices ,user}) => {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!user) return; // Không làm gì nếu deviceId chưa được cung cấp

        console.log(user)
        const thisUser = { ...user };
        thisUser.deviceId = deviceId
        // Khởi tạo socket với deviceId
        const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:8080', {
            query: { user: JSON.stringify(thisUser) } // Gửi deviceId trong query
        });

        // Lưu tham chiếu socket
        socketRef.current = socket;

        // Khi kết nối với server thành công
        socket.on('connect', () => {
            console.log('Connected to WebSocket server with deviceId:', deviceId);
        });

        // Lắng nghe sự kiện 'device:data' từ server
        socket.on('device:data', (message) => {
            const {deviceId, data} = message
            console.log('Data received from server:', data);
            if (data.type === 'air') setAir(data.mqttData.a);
            else if (data.type === 'light') setLight(data.mqttData.a);
            else if (data.type === 'switch') setSwitch(data.mqttData.a);
            else if(data.type === 'led') setLed(data.mqttData.a);
            else if(data.type === 'toggle') setToggle(data.mqttData.a);
            else console.log('Không nhận được data');
        });

        socket.on('device:status', (data) => {
            console.log('Status change received from server:', data);
            const { deviceId, status } = data;
            // const device = devices.find(item => item.deviceId === deviceId)
            setDevices(prevDevices => ({
                ...prevDevices, // Giữ nguyên các thiết bị khác
                [deviceId]: { status: status } // Cập nhật trạng thái của thiết bị cụ thể
              }));
            // devices[deviceId].status = status
        });
        
        socket.on('message', (data) => {
            console.log('list device with status received from server:', data);
            const { devicesOfUser } = data;
            setDevices(devicesOfUser);
        });

        // Xử lý ngắt kết nối
        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        // Cleanup socket khi deviceId thay đổi hoặc component bị unmount
        return () => {
            console.log(`Cleaning up socket for userId: ${user.userId}`);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user]); // Re-run effect khi user thay đổi

    // Hàm để gửi dữ liệu qua socket
    const send = (deviceId, topic, data) => {
        if (socketRef.current) {
            console.log(`Sending message with data:`, data);
            socketRef.current.emit('message', {deviceId, topic, data});
        } else {
            console.error('Socket is not initialized');
        }
    };
    const sendDeviceId = (deviceId) => {
        if (socketRef.current) {
            console.log(`Sending change deviceId with data:`, deviceId);
            socketRef.current.emit('change-device', {deviceId});
        } else {
            console.error('Socket is not initialized');
        }
    }

    // Trả về hàm send
    return { send, sendDeviceId }; 
};

export default useSocket;
