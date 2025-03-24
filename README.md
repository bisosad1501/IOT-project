# IOI-SmartAgri

![Demo website](https://github.com/Dung-Pham/online-img/blob/main/IOT-SmartAgri/mpS9HqOkC5.gif
)

---
## Tổng quan

-  **Hệ thống cho phép** :
   -  **Nhiều người dùng** sử dụng
   -  **Mỗi người dùng** có **nhiều thiết bị** và có thể **mở rộng** thêm
   -  Xem **dữ liệu realtime** thu thập từ các thiết bị cảm biến
   -  **Điều khiển** đèn, mái che tới **đúng thiết bị** mong muốn

---
## Cài đặt phần cứng
- Kết nối arduino với esp32 qua giao thức uart
- Nạp code vào esp,arduino cho thiết bị  $\color{green}{{dev001}}$ bằng các file ở trong folder $\color{violet}{{\textbf{unoR3-esp32}}}$
- Chuẩn bị thêm esp32 để test cho thiết bị $\color{green}{{dev002}}$

$\color{yellow}{{Lưu ý}}$
- Sửa lại mạng đang sử dụng & địa chỉ broker đang chạy local

---
## Cài đặt phần mềm
### Broker
- Chạy file $\color{green}{{broker.js}}$ ở folder $\color{violet}{{\textbf{mqtt-broker}}}$ để chạy broker

$\color{yellow}{{Lưu ý}}$
- Dùng chung 1 mạng với các thiết bị 
- Lấy địa chỉ $\color{green}{{broker}}$ đang chạy local được in ra khi khởi động broker 
- Dùng địa chỉ đó cho vào các $\color{green}{{client}}$ kết nối tới $\color{green}{{broker}}$
### Server
- import database vào mysql, dùng file $\color{green}{{iot-db.sql}}$ ở trong folder $\color{violet}{{\textbf{iot-api}}}$
- Chạy server:
  ```
  npm install
  ```
  ```
  npm start
  ```
- Địa chỉ: http://localhost:8080/
  
$\color{yellow}{{Lưu ý}}$
- Sửa lại địa chỉ $\color{green}{{broker}}$ đang chạy local ở các file $\color{green}{connectBroker.js}$ và $\color{green}{server.js}$

### Client
- Chạy client:
  ```
  npm install
  ```
  ```
  npm start
  ```
- địa chỉ: http://localhost:3000/
---
$\color{red}{{Lưu ý}}$

  **run server -> run client -> run broker -> connect device**


