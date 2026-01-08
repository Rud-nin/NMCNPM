# Service APIs – Frontend Integration Guide

Mô tả các API liên quan đến **dịch vụ (Service)**

---


Base URL: `/api/services`

---

### 1. Lấy danh sách service của user hiện tại (có cả service phòng)
**GET** `/api/services/users`

- Trả về danh sách dịch vụ cá nhân và dịch vụ của phòng mà user đang ở, kèm thông tin hóa đơn tháng hiện tại

Response:
```json
{
    "success": true,
    "data": [
        {
            "ServiceID": 1,
            "ServiceName": "Internet",
            "Price": 120000,
            "Descriptions": "Internet service per month",
            "Type": "Personal",
            "Period": "01/26",
            "Status": "Unpaid"
        },
        ...
    ]
}
```

### 2. Lấy danh sách service của phòng hiện tại
**GET** `/api/services/rooms`

- Trả về danh sách dịch vụ của phòng mà user đang ở, kèm thông tin hóa đơn tháng hiện tại

Response:
```json
{
    "success": true,
    "data": [
        {
            "ServiceID": 2,
            "ServiceName": "Electricity",
            "Price": 50000,
            "Descriptions": "Monthly electricity",
            "Type": "Room",
            "Period": "01/26",
            "Status": "Paid"
        },
        ...
    ]
}
```

### 3. Admin: Lấy tất cả service (có phân trang)
**GET** `/api/services/all?page=1&limit=10`

- Lấy danh sách tất cả dịch vụ với phân trang

Response:
```json
{
    "success": true,
    "pagination": {
        "page": 1,
        "limit": 10,
        "totalRows": 20,
        "totalPages": 2
    },
    "data": [
        {
            "ServiceID": 1,
            "ServiceName": "Internet",
            "Price": 120000,
            "Descriptions": "Internet service per month",
            "Type": "Personal"
        },
        ...
    ]
}
```

### 4. Admin: Lấy service của một user cụ thể
**GET** `/api/services/users/:userId`

- Lấy danh sách dịch vụ của user chỉ định, kèm thông tin hóa đơn tháng hiện tại

Response:
```json
{
    "success": true,
    "data": [
        {
            "ServiceID": 1,
            "ServiceName": "Internet",
            "Price": 120000,
            "Descriptions": "Internet service per month",
            "Type": "Personal",
            "Period": "01/26",
            "Status": "Unpaid"
        },
        ...
    ]
}
```

### 5. Admin: Thêm service cho user
**POST** `/api/services/users/assign`

Body:
```json
{
  "userID": 1,
  "serviceID": 1
}
```

- Thêm dịch vụ cho user và tự động tạo hóa đơn tháng hiện tại nếu chưa có
- Không thể thêm dịch vụ loại `Room` cho user

Response:
```json
{
    "success": true,
    "message": "Service assigned to user successfully"
}

{
    "success": false,
    "message": "User has already had this service"
}
```

### 6. Admin: Xóa service của user
**DELETE** `/api/services/users/remove`

Body:
```json
{
  "userID": 1,
  "serviceID": 1
}
```

- Xóa dịch vụ khỏi user
- Không thể xoá dịch vụ loại `Room`

Response:
```json
{
    "success": true,
    "message": "Service removed from user successfully"
}

{
    "success": false,
    "message": "Không tìm thấy dịch vụ cá nhân hợp lệ"
}
```

### 7. Admin: Lấy service của một phòng cụ thể
**GET** `/api/services/rooms/:roomId`

- Lấy danh sách dịch vụ của phòng chỉ định, kèm thông tin hóa đơn tháng hiện tại

Response:
```json
{
    "success": true,
    "data": [
        {
            "ServiceID": 2,
            "ServiceName": "Electricity",
            "Price": 50000,
            "Descriptions": "Monthly electricity",
            "Type": "Room",
            "Period": "01/26",
            "Status": "Paid"
        },
        ...
    ]
}
```

### 8. Admin: Thêm service cho phòng
**POST** `/api/services/rooms/assign`

Body:
```json
{
  "roomID": 1,
  "serviceID": 2
}
```

- Thêm dịch vụ cho phòng và tự động tạo hóa đơn tháng hiện tại nếu chưa có
- Không thể thêm dịch vụ loại `Personal` cho room

Response:
```json
{
    "success": true,
    "message": "Service assigned to room successfully"
}
{
    "success": false,
    "message": "Room has already had this service"
}
```

### 9. Admin: Xóa service của phòng
**DELETE** `/api/services/rooms/remove`

Body:
```json
{
  "roomID": 1,
  "serviceID": 2
}
```

- Xóa dịch vụ khỏi phòng
- Không thể xoá dịch vụ loại `Personal`

Response:
```json
{
    "success": true,
    "message": "Service removed from room successfully"
}

{
    "success": false,
    "message": "Không tìm thấy dịch vụ phòng hợp lệ"
}
```

### 10. Admin: Tạo service mới
**POST** `/api/services`

Body:
```json
{
  "ServiceName": "New Service",
  "Price": 75000,
  "Descriptions": "Description of new service",
  "Type": "Personal"
}
```

- Tạo dịch vụ mới

Response:
```json
{
    "success": true,
    "data": {
        "ServiceID": 7
    }
}
```

### 11. Admin: Cập nhật service
**PATCH** `/api/services/:id`

Body:
```json
{
  "ServiceName": "Updated Service",
  "Price": 80000,
  "Descriptions": "Updated description",
  "Type": "Room"
}
```

- Cập nhật thông tin dịch vụ

Response:
```json
{
    "success": true,
    "message": "Service updated successfully"
}
```

### 12. Admin: Xóa service
**DELETE** `/api/services/:id`

- Xóa dịch vụ (chỉ khi không còn tham chiếu)

Response:
```json
{
    "success": true,
    "message": "Update completed"
}
```

---