import paho.mqtt.client as mqtt
import time
from threading import Thread

BROKER_ADDRESS = "***.***.***.***"
PORT = 1883

# Hàm xử lý khi kết nối thành công
def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe("dev001/led")  
    client.subscribe("dev001/toggle")

# Hàm xử lý khi nhận được tin nhắn
def on_message(client, userdata, message):
    print(f"Message received on {message.topic}: {message.payload.decode()}")

# Hàm publish dữ liệu liên tục
def continuous_publish():
    while True:
        publish_message("dev001/data/air", "123")
        publish_message("dev001/data/light", "456")
        publish_message("dev001/data/rain", "789")
        time.sleep(2)  # Dừng 1 giây trước khi gửi dữ liệu tiếp

# Hàm publish một tin nhắn
def publish_message(topic, message):
    client.publish(topic, message)
    print(f"Message published to {topic}: {message}")

# Khởi tạo client MQTT
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Kết nối đến broker
client.connect(BROKER_ADDRESS, PORT)

# Chạy luồng xử lý publish liên tục
thread = Thread(target=continuous_publish)
thread.daemon = True  # Đảm bảo thread dừng khi chương trình chính dừng
thread.start()

# Chạy loop chính của MQTT client
client.loop_forever()
