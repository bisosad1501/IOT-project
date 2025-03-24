#include "MQ135.h" 
#include <SoftwareSerial.h>
#include <BH1750.h>
#include <Wire.h>
#include <Servo.h> 
#include <LiquidCrystal_I2C.h>

// Variable Initialize 
LiquidCrystal_I2C lcd(0x27,16,2);

Servo myservoR;
Servo myservoL;          

int BH1750address = 0x23;
byte buff[2];
float lux;

MQ135 mq135_sensor = MQ135(A3);   
float ppm;
int rain;

SoftwareSerial mySerial(6, 7); //TX, RX

int chedo = 1;


int moc[10];
String data[10];

// Setup
void setup() {
  Serial.begin(9600);
  mySerial.begin(9600);
  Wire.begin();
  lcd.init();             
  lcd.backlight();
  myservoR.attach(3);  
  myservoL.attach(2);
  pinMode(13,OUTPUT);
  pinMode(12,OUTPUT);
  pinMode(11,OUTPUT);
  pinMode(10,INPUT);
}

// Function

void guidulieu(){
  mySerial.print(lux);
  mySerial.print(";");
  mySerial.print(ppm);
  mySerial.print(";");
  mySerial.print(digitalRead(10));
  mySerial.println("*");
}

void light(){
  int i;
  uint16_t val = 0;
  BH1750_Init(BH1750address);
  delay(200);

  if (2==BH1750_Read(BH1750address)){
    val = ((buff[0]<<8)|buff[1])/1.2;
    lux = (float)val;
    Serial.print("Light: ");
    Serial.print(lux);
    Serial.println("[lx]");
  }
}

int BH1750_Read(int bh1750_address){
  int i = 0;
  Wire.beginTransmission(bh1750_address);
  Wire.requestFrom(bh1750_address, 2);
  while(Wire.available()){
    buff[i] = Wire.read();
    i++;
  }
  Wire.endTransmission();
  return i;
}

void BH1750_Init(int bh1750_address){
  Wire.beginTransmission(bh1750_address);
  Wire.write(0x10);
  Wire.endTransmission();
}

void air(){
  ppm = mq135_sensor.getPPM();
  Serial.print("PPM: ");
  Serial.println(ppm);
}

void momai(){
  myservoR.write(90);
  myservoL.write(90);
  delay(2000);
}

void dongmai(){
  myservoR.write(0);
  myservoL.write(180);
  delay(2000);
}

void automode(){
if (lux>5000 || digitalRead(10)==0) dongmai();
else momai();
if (lux<10) digitalWrite(12,HIGH);
else if(lux>50) digitalWrite(12,LOW);
}

void display(){
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("A/s:");
  lcd.setCursor(5,0);
  lcd.print(lux);
  lcd.setCursor(13,0);
  lcd.print("lux");
  lcd.setCursor(0,1);
  lcd.print("ppm:");
  lcd.setCursor(5,1);
  lcd.print(ppm);
}

void nhandulieu(){ //nhan du lieu tu gateway
  Serial.println(mySerial.available());
  if (mySerial.available()) {
    String input = mySerial.readString();
    Serial.println(input);
    input.trim();
    if (input.equals("chedo0")) {
      // Handle chedo0
      chedo = 0;
      digitalWrite(12,LOW);
      momai();
    } else if (input.equals("chedo1")) {
      // Handle chedo1
      chedo = 1;
    } else if (input.equals("led0")) {
      // Handle led0
      if (!chedo){
        digitalWrite(12,LOW);
      }
    } else if (input.equals("led1")) {
      // Handle led1
      if (!chedo){
        digitalWrite(12,HIGH);
      }  
    } else if (input.equals("mai0")) {
      // Handle mai0
      if (!chedo){
        momai();
      }  
    } else if (input.equals("mai1")) {
      // Handle mai1
      if (!chedo){
        dongmai();
      }  
    } else {
        // Handle unknown input
    }
  }
  else {
    Serial.println("serial not available!");
  }
}

void loop() {
  light();
  air();
  display();
  guidulieu();
  nhandulieu();
  if (chedo == 1) {
    automode();
  }
  delay(2000);
}