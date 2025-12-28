# ParkEase Backend

停车位出租平台后端服务 - Spring Boot 3.x + PostgreSQL + JWT

## 技术栈

- **Java 17**
- **Spring Boot 3.2.0**
- **PostgreSQL**
- **Spring Security + JWT**
- **Spring Data JPA**
- **Maven**

## 项目结构

```
src/main/java/com/parkease/
├── ParkEaseApplication.java          # 主应用类
├── config/                           # 配置类
│   ├── SecurityConfig.java          # Spring Security配置
│   ├── JwtUtil.java                 # JWT工具类
│   ├── JwtAuthenticationFilter.java # JWT认证过滤器
│   ├── CustomUserDetails.java       # 自定义UserDetails
│   └── CustomUserDetailsService.java # 用户详情服务
├── controller/                       # REST控制器
│   ├── AuthController.java
│   ├── ParkingSpotController.java
│   ├── ReservationController.java
│   └── ReviewController.java
├── service/                          # 业务逻辑层
│   ├── AuthService.java
│   ├── ParkingSpotService.java
│   ├── ReservationService.java
│   └── ReviewService.java
├── repository/                       # 数据访问层
│   ├── UserRepository.java
│   ├── ParkingSpotRepository.java
│   ├── ReservationRepository.java
│   └── ReviewRepository.java
├── entity/                           # 实体类
│   ├── User.java
│   ├── ParkingSpot.java
│   ├── Reservation.java
│   └── Review.java
├── dto/                              # 数据传输对象
│   ├── RegisterRequest.java
│   ├── LoginRequest.java
│   ├── AuthResponse.java
│   ├── ParkingSpotRequest.java
│   ├── ParkingSpotResponse.java
│   ├── ReservationRequest.java
│   ├── ReservationResponse.java
│   ├── ReviewRequest.java
│   └── ReviewResponse.java
├── enums/                            # 枚举类
│   ├── SpotType.java
│   └── ReservationStatus.java
└── exception/                        # 异常处理
    └── GlobalExceptionHandler.java
```

## 环境要求

- JDK 17+
- Maven 3.6+
- PostgreSQL 12+

## 本地开发设置

### 1. 数据库设置

创建PostgreSQL数据库：

```sql
CREATE DATABASE parkease;
```

### 2. 配置文件

编辑 `src/main/resources/application.yml`，配置数据库连接信息：

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/parkease
    username: your_username
    password: your_password
```

### 3. JWT密钥配置

生产环境请修改 `application.yml` 中的 JWT secret：

```yaml
jwt:
  secret: your-very-long-random-secret-key-minimum-256-bits
```

### 4. 运行项目

```bash
# 使用Maven运行
mvn spring-boot:run

# 或者打包后运行
mvn clean package
java -jar target/parkease-backend-1.0.0.jar
```

服务启动后，API将在 `http://localhost:8080/api` 上可用。

## API端点

### 认证 API

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 停车位 API

- `GET /api/spots` - 搜索停车位（支持筛选：city, spotType, priceMin, priceMax, date）
  - `city`: 城市名称
  - `spotType`: 停车位类型（GARAGE, DRIVEWAY, STREET, LOT）
  - `priceMin`: 最低价格（每小时）
  - `priceMax`: 最高价格（每小时）
  - `date`: 日期（ISO格式：YYYY-MM-DD），筛选该日期可用的停车位
- `GET /api/spots/{id}` - 获取停车位详情
- `POST /api/spots` - 发布停车位（需认证）
- `PUT /api/spots/{id}` - 编辑停车位（需认证，仅车位主人）
- `DELETE /api/spots/{id}` - 删除停车位（需认证，仅车位主人）
- `GET /api/spots/my` - 获取我发布的停车位（需认证）

### 预订 API

- `POST /api/reservations` - 创建预订（需认证）
- `GET /api/reservations/my` - 我的预订（需认证）
- `GET /api/reservations/hosting` - 我收到的预订（需认证）
- `PUT /api/reservations/{id}/confirm` - 确认预订（需认证，仅车位主人）
- `PUT /api/reservations/{id}/cancel` - 取消预订（需认证）

### 评价 API

- `POST /api/spots/{spotId}/reviews` - 添加评价（需认证）
- `GET /api/spots/{spotId}/reviews` - 获取停车位的评价

## 认证

所有需要认证的API需要在HTTP Header中携带JWT token：

```
Authorization: Bearer {token}
```

登录成功后，响应会返回JWT token，有效期7天。

## 业务逻辑

### 预订冲突检测

创建预订前，系统会检查该时间段是否已有已确认的预订。如果有冲突，返回400错误。

### 价格计算

- 预订时长 < 24小时：使用 `price_per_hour * 小时数`
- 预订时长 >= 24小时：使用 `price_per_day * 天数`

### 评价规则

- 只有已完成预订的用户才能评价
- 每个用户对每个停车位只能评价一次

## 数据库表

### users
- id, email, password, name, phone, created_at

### parking_spots
- id, host_id, title, description, address, city, state, zip_code, latitude, longitude, price_per_hour, price_per_day, image_url, spot_type, is_available, created_at

### reservations
- id, spot_id, renter_id, start_time, end_time, total_price, status, created_at

### reviews
- id, spot_id, renter_id, rating, comment, created_at

## 开发说明

- 使用 `ddl-auto: update` 自动更新数据库schema（开发环境）
- 生产环境建议使用 `ddl-auto: validate`
- JWT secret在生产环境必须使用强密钥
- CORS已配置为允许所有来源（开发环境），生产环境应限制为前端域名

