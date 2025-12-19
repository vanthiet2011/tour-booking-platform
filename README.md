# 🌏 Tour Booking Platform

> Nền tảng đặt tour du lịch chuyên nghiệp, hiệu năng cao, xây dựng trên kiến trúc Microservices & Next.js.

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
![.NET](https://img.shields.io/badge/.NET%209-512BD4?style=flat&logo=dotnet&logoColor=white)
![Next JS](https://img.shields.io/badge/Next.js%2014-black?style=flat&logo=next.js&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=flat&logo=postgresql&logoColor=white)

## 📖 Giới thiệu

Hệ thống quản lý và đặt tour du lịch, bao gồm các tính năng: tìm kiếm tour, đặt chỗ, thanh toán, quản lý người dùng và đánh giá. Hệ thống được thiết kế để dễ dàng mở rộng (scalable) và bảo trì.

## 🛠 Tech Stack

### Backend (Microservices)

- **Framework:** .NET 9 (ASP.NET Core Web API)
- **Database:** PostgreSQL (Mỗi service có DB riêng biệt)
- **Message Bus:** Apache Kafka (Xử lý bất đồng bộ)
- **Caching:** Redis (Distributed Cache)
- **API Gateway:** Ocelot
- **Architecture:** Clean Architecture, CQRS Pattern

### Frontend

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **State Management:** React Hooks / Context API

### Infrastructure

- **Containerization:** Docker & Docker Compose

---

## 🏗 Kiến trúc Hệ thống

Hệ thống bao gồm các services chính sau đây:

| Service Name        | Port (Host) | Port (Docker) | Mô tả                                                 |
| :------------------ | :---------- | :------------ | :---------------------------------------------------- |
| **Api Gateway**     | `8000`      | `8080`        | Cổng vào duy nhất (Entry point) cho toàn bộ hệ thống. |
| **Frontend**        | `3000`      | `3000`        | Giao diện người dùng Next.js.                         |
| **Auth Service**    | `5001`      | `8080`        | Quản lý xác thực, phân quyền (JWT).                   |
| **User Service**    | `5002`      | `8080`        | Quản lý thông tin người dùng (Profile).               |
| **Tour Service**    | `5003`      | `8080`        | Quản lý danh sách tour, địa điểm, hình ảnh.           |
| **Booking Service** | `5004`      | `8080`        | Xử lý logic đặt tour, giữ chỗ.                        |
| **Payment Service** | `5005`      | `8080`        | Tích hợp thanh toán.                                  |
| **Search Service**  | `5006`      | `8080`        | Tìm kiếm nâng cao.                                    |

---

## 🚀 Hướng dẫn Cài đặt & Chạy (Getting Started)

Để chạy dự án này trên máy cục bộ, bạn cần cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop).

## 1. Clone dự án

```bash
git clone [https://github.com/your-username/tour-booking-platform.git](https://github.com/your-username/tour-booking-platform.git)
cd tour-booking-platform
```

## 2. Thiết lập Biến môi trường (Environment Variables)

### ⚠️ Lưu ý quan trọng

Vì lý do bảo mật, các file chứa mật khẩu (**`appsettings.json`**, **`.env`**) **không được đưa lên Git**.  
Bạn cần **tạo chúng từ các file mẫu (Example)** trước khi chạy hệ thống.

---

### Cấu hình Backend

Truy cập vào từng thư mục Service  
(ví dụ: `backend/AuthService`, `backend/TourService`, ...), sau đó thực hiện:

1. Tìm file:
2. Copy và đổi tên thành: appsettings.Development.json.
3. _(Tùy chọn)_ Cập nhật mật khẩu **Database** nếu bạn thay đổi cấu hình mặc định trong Docker.

---

### Cấu hình Frontend

Truy cập thư mục: frontend/my-app

Thực hiện các bước sau:

1. Tìm file: .env.example
2. Copy và đổi tên thành: .env.local

---

### Khởi chạy hệ thống

Tại **thư mục gốc của dự án** (nơi chứa file `docker-compose.yml`), chạy lệnh:

```bash
docker-compose up -d --build
```

Lệnh này sẽ:

- Tải về các image cần thiết (Postgres, Redis, Kafka, ...)
- Build source code **Backend** và **Frontend**
- Khởi động toàn bộ hệ thống

---

### Truy cập hệ thống

Sau khi Docker chạy xong (đợi khoảng **1–2 phút**), bạn có thể truy cập:

- **Trang chủ (Web App):**  
  http://localhost:3000

- **API Gateway:**  
  http://localhost:8000

- **Swagger (Auth Service):**  
  http://localhost:5001/swagger

- **Swagger (Tour Service):**  
  http://localhost:5003/swagger
