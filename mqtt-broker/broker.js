const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);
const os = require('os'); // Thêm thư viện os để lấy địa chỉ IP
const PORT = 1883;

server.listen(PORT, () => {
  const interfaces = os.networkInterfaces();
  let address = 'localhost'; // Mặc định là localhost

  // Lặp qua các interface để tìm địa chỉ IP
  for (const iface in interfaces) {
    for (const details of interfaces[iface]) {
      // Kiểm tra nếu địa chỉ là IPv4 và không phải là địa chỉ loopback
      if (details.family === 'IPv4' && !details.internal) {
        address = details.address; // Lấy địa chỉ IP
        break;
      }
    }
  }
  console.log(`MQTT broker is running on ${address}:${PORT}`); // In ra địa chỉ IP và cổng
});

aedes.on('client', (client) => {
  console.log(`Client connected: ${client.id}`);
});

aedes.on('publish', (packet, client) => {
  console.log(`Message received on topic ${packet.topic}: ${packet.payload.toString()}`);
});

aedes.on('subscribe', (subscriptions, client) => {
  console.log(`Client ${client?.id} subscribed to topics: ${subscriptions.map(s => s.topic).join(', ')}`);
});
