# Room & Room Request APIs – Frontend Integration Guide

Mô tả các API liên quan đến **phòng ở (Room)** và **yêu cầu vào phòng (Room Request)**

---

## I. ROOM APIs

Base URL: `/api/rooms`

---

### I.1. Lấy danh sách phòng (có phân trang)
**GET** `/api/rooms?page=1&limit=10`

- Lấy danh sách tất cả các phòng
- Hỗ trợ phân trang

Response:
```json
{
    "success": true,
    "pagination": {
        "page": 1,
        "limit": 10,
        "totalRows": 6,
        "totalPages": 1
    },
    "data": [
        {
            "RoomID": 4,
            "RoomNumber": 201,
            "Building": "B13",
            "Capacity": 4,
            "Occupancy": 0
        },
        ...
    ]
}
```

### I.2. Lấy danh sách phòng (có phân trang)
**GET** `/api/rooms/available?page=1&limit=10`

- Chỉ trả về các phòng có Occupancy < Capacity
- Dùng cho user chọn phòng để gửi yêu cầu

### I.3. User xem danh sách người trong phòng của mình

**GET** `/api/rooms/me`

- Trả về danh sách user đang ở cùng phòng với user hiện tại
```json
{
    "success": true,
    "room": {
        "RoomID": 1,
        "RoomNumber": 101,
        "Building": "B5",
        "Capacity": 4,
        "Occupancy": 4
    },
    "users": [
        {
            "UserID": 3,
            "FullName": "Le Van C",
            "Email": "user3@example.com",
            "StudentID": "20236666",
            "BirthDate": "2005-11-02T00:00:00.000Z",
            "ProfilePic": ""
        },
        ...
    ]
}
```

- Nếu user chưa có phòng → trả lỗi
```json
{
    "success": false,
    "message": "You are not assigned to any room"
}
```

### I.4. Admin tạo phòng mới
**POST** `/api/rooms`

Body:
```json
{
  "Building": "A",
  "RoomNumber": 203,
  "Capacity": 4
}
```

Validation:
- Không cho phép trùng `Building` + `RoomNumber`
```json
{
    "success": false,
    "message": "Room already exists"
}

{
    "success": true,
    "message": "Room created successfully"
}
```

### I.5. Admin xóa phòng
**DELETE** `/api/rooms/:id`

- Xóa phòng theo RoomID
- Chỉ được phép xoá phòng không có người
- Nếu xoá một phòng đang có roomRequest trỏ vào, rr.roomID được set về NULL
```json
{
    "success": true,
    "message": "Room deleted successfully"
}

{
    "success": false,
    "message": "Cannot delete room because it still has users"
}

{
    "success": false,
    "message": "Room not found"
}
```

### I.6. Admin chuyển user vào phòng
**PUT** `/api/rooms/assign`

Body
```json
{
  "userId": 1,
  "roomId": 2
}
```
- false khi user đang ở sẵn trong phòng
- Không thể chuyển đến phòng full, phòng không tồn tại
```json
{
    "success": true,
    "message": "User assigned to room"
}

{
    "success": false,
    "message": "Room is already full"
}

{
    "success": false,
    "message": "User is already a resident of this room"
}
```

### I.7. Admin gỡ user khỏi phòng
**PUT** `/api/rooms/remove/:userId`

```json
{
    "success": true,
    "message": "User removed from room"
}
```

### I.8. Admin lấy danh sách user trong một phòng cụ thể
**GET** `/api/rooms/:id`

- Hỗ trợ phân trang
- false khi không tồn tại phòng

```json
{
    "success": true,
    "room": {
        "RoomID": 1,
        "Building": "B5",
        "RoomNumber": 101,
        "Capacity": 4,
        "Occupancy": 4
    },
    "users": [
        {
            "UserID": 3,
            "FullName": "Le Van C",
            "Email": "user3@example.com",
            "StudentID": "20236666",
            "BirthDate": "2005-11-02T00:00:00.000Z",
            "ProfilePic": ""
        },
        ...
    ]
}

{
    "success": false,
    "message": "Room not found"
}
```
---
## II. ROOM_REQUEST APIs

Base URL: `/api/room-requests`

---

### II.1. Tạo yêu cầu vào phòng
**POST** `/api/room-requests`

Body:
```json
{
  "RoomID": 6
}
```
- Không được tạo hai yêu cầu (pending) đến cùng một phòng (nếu bị reject thì có thể request lại)
- Chỉ được tạo yêu cầu khi có phòng, có thể yêu cầu vào phòng đầy (admin handle)
```json
{
    "success": true,
    "message": "Room request created successfully"
}

{
    "success": false,
    "message": "Can not request to one room twice"
}
```

### II.2. Lấy danh sách các request của mình
**GET** `/api/room-requests/me`

- Trả về lịch sử các yêu cầu đã gửi, thời gian xử lý `ProcessedAt` (nếu approved/rejected)
```json
{
    "success": true,
    "data": [
        {
            "RequestID": 2,
            "UserID": 8,
            "RoomID": 1,
            "Status": "Rejected",
            "CreatedAt": "2026-01-03T17:18:04.773Z",
            "ProcessedAt": "2026-01-03T17:54:57.077Z",
            "RoomNumber": 101,
            "Building": "B5"
        },
        ...
    ]
}
```

### II.3. Huỷ yêu cầu vào phòng
**DELETE** `/api/room-requests/:id`

- Cho phép User huỷ yêu cầu khi trạng thái vẫn là `Pending` -> `Cancelled`
```json
{
    "success": true,
    "message": "Request cancelled"
}
```

### II.4. Admin lấy danh sách các yêu cầu
**GET** `/api/room-requests?status=pending&page=1&limit=10`

Query Params:

- `status` (pending | approved | rejected | all) default null (để trống -> all)
- `page` default 1
- `limit` default 10


```json
{
    "success": true,
    "pagination": {
        "page": 1,
        "limit": 10,
        "totalRows": 10,
        "totalPages": 1
    },
    "data": [
        {
            "RequestID": 18,
            "UserID": 8,
            "RoomID": 9,
            "Status": "Pending",
            "CreatedAt": "2026-01-04T00:43:26.327Z",
            "ProcessedAt": null,
            "FullName": "Tran Van H",
            "RoomNumber": 203,
            "Building": "B9"
        },
        ...
    ]
}
```

### II.5. Admin phê duyệt yêu cầu
**PUT** `/:id/approve`

- Chuyển trạng thái thành `Approved`, update `RoomID`
- fail khi approve vào phòng full hoặc status khác `Pending`

```json
{
    "success": true,
    "message": "Request approved successfully"
}

{
    "success": false,
    "message": "Room is already full"
}
```

### II.6. Admin từ chối yêu cầu
**PUT** `/:id/reject`

- Chuyển trạng thái thành `Rejected`
- fail khi status khác `Pending`

```json
{
    "success": true,
    "message": "Request rejected successfully"
}
```

### Ghi chú
- Tất cả API trả về success, pagination (nếu có) và data