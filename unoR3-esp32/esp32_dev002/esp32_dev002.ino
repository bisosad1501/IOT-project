#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>


const char* ssid = "P503";
const char* password = "00001111";
const char* mqttServer = "***.***.***.***";  // IP của broker
const int mqttPort = 1883;
int number = 0;
String input = "";
WiFiClient espClient;
PubSubClient client(espClient);

float lux, ppm, rain;
int Switch, led, toggle;
int moc[10];  // mảng lưu số dữ liệu trong 1 khung truyền
String data[10];

void callback(char* topic, byte* payload, unsigned int length) {
  String incommingMessage = "";
  for (int i = 0; i < length; i++) incommingMessage += (char)payload[i];
  Serial0.println("Message received on topic [" + String(topic) + "]: " + incommingMessage);
  Serial2.println(incommingMessage);
}

void setup() {
  // Serial2.begin(9600, SERIAL_8N1, 16, 17);
  Serial.begin(9600);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("Connected to WiFi");
  client.setServer(mqttServer, mqttPort);
  client.setKeepAlive(2);
  String deviceId = "dev002";
  String willTopic = "devices/" + deviceId + "/status";
  String willMessage = "offline";
  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");
    if (client.connect(deviceId.c_str(), NULL, NULL, willTopic.c_str(), 1, true, willMessage.c_str())) {
      Serial.println("Connected to MQTT broker");
      // Gửi trạng thái online
      client.publish(willTopic.c_str(), "online", true);

      client.subscribe("dev002/led");
      client.subscribe("dev002/toggle");
      client.subscribe("dev002/switch");

    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
  client.setCallback(callback);
}


void loop() {
  // Sinh dữ liệu ngẫu nhiên cho các cảm biến
  lux = random(0, 1000) / 10.0;  // Giá trị ngẫu nhiên ánh sáng từ 0.0 đến 100.0
  ppm = random(300, 1000);       // Giá trị ppm từ 300 đến 1000
  rain = random(0, 2);           // Giá trị mưa: 0 hoặc 1
  Switch = random(0, 2);         // Trạng thái công tắc: 0 hoặc 1
  led = random(0, 2);            // Trạng thái đèn LED: 0 hoặc 1
  toggle = random(0, 2);         // Trạng thái toggle: 0 hoặc 1

  // In dữ liệu ngẫu nhiên ra Serial để kiểm tra
  Serial.println("NODE: ");
  Serial.print("Generated light:  ");
  Serial.println(lux);
  Serial.print("Generated ppm:  ");
  Serial.println(ppm);
  Serial.print("Generated rain:  ");
  Serial.println(rain);
  Serial.print("Generated switch:  ");
  Serial.println(Switch);
  Serial.print("Generated led:  ");
  Serial.println(led);
  Serial.print("Generated toggle:  ");
  Serial.println(toggle);
  Serial.println("-----------------------------------------");

  // Gửi dữ liệu ngẫu nhiên lên MQTT broker
  client.loop();
  client.publish("dev002/data/light", String(lux).c_str());
  client.publish("dev002/data/air", String(ppm).c_str());
  client.publish("dev002/data/rain", String(rain).c_str());
  client.publish("dev002/data/led", String(led).c_str());
  client.publish("dev002/data/toggle", String(toggle).c_str());
  client.publish("dev002/data/switch", String(Switch).c_str());

  delay(1000);  // Gửi dữ liệu mỗi giây
}