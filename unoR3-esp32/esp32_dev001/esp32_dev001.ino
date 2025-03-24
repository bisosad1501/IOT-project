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


void nhan_du_lieu() {
  int j = 1;
  int end;
  moc[0] = -1;
  if (Serial2.available()) {
    input = Serial2.readString();
    Serial.println(input);
    for (int i = 0; i < input.length(); i++) {
      if (input[i] == '*') {
        end = i;
        break;
      }
      if (input[i] == ';') {
        moc[j] = i;
        j++;
      }
    }
    for (int t = 0; t < j; t++) {
      if (t < j - 1) data[t] = input.substring(moc[t] + 1, moc[t + 1]);
      else data[t] = input.substring(moc[t] + 1, end);
    }
  }
}

void setup() {
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
  Serial.begin(9600);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("Connected to WiFi");
  client.setServer(mqttServer, mqttPort);
  client.setKeepAlive(2);
  String deviceId = "dev001";
  String willTopic = "devices/" + deviceId + "/status";
  String willMessage = "offline";
  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");
    if (client.connect(deviceId.c_str(), NULL, NULL, willTopic.c_str(), 1, true, willMessage.c_str())) {
      Serial.println("Connected to MQTT broker");
      // Gửi trạng thái online
      client.publish(willTopic.c_str(), "online", true);

      client.subscribe("dev001/led");
      client.subscribe("dev001/toggle");
      client.subscribe("dev001/switch");

    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
  client.setCallback(callback);
}



void loop() {
  if (Serial.available()) {
    String inputChar = Serial.readString();  // Đọc ký tự nhập từ Serial Monitor
    inputChar.trim();
    if (inputChar.equals("led1") || inputChar.equals("led0")) {
      // Khi nhận được '1', gửi dữ liệu xuống Arduino
      Serial2.println(inputChar);
      Serial.println("Sent input to Arduino.");
    }
  }
  nhan_du_lieu();
  lux = data[0].toFloat();
  ppm = data[1].toFloat();
  rain = data[2].toFloat();
  Switch = data[3].toFloat();
  led = data[4].toInt();
  toggle = data[5].toInt();
  Serial.println("NODE: ");
  Serial.print("Recieved light:  ");
  Serial.println(lux);
  Serial.print("Recieved ppm:  ");
  Serial.println(ppm);
  Serial.print("Recieved rain:  ");
  Serial.println(rain);
  Serial.print("Recieved switch:  ");
  Serial.println(Switch);
  Serial.print("Recieved led:  ");
  Serial.println(led);
  Serial.print("Recieved toggle:  ");
  Serial.println(toggle);
  Serial.println("-----------------------------------------");
  client.loop();
  // String s_number = String(number);
  client.publish("dev001/data/light", String(lux).c_str());
  client.publish("dev001/data/air", String(ppm).c_str());
  client.publish("dev001/data/rain", String(rain).c_str());
  client.publish("dev001/data/led", String(led).c_str());
  client.publish("dev001/data/toggle", String(toggle).c_str());
  client.publish("dev001/data/switch", String(Switch).c_str());

  delay(1000);
}