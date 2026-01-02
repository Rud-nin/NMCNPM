# Mô tả các hàm
File auth.routes.js: Định tuyến các URL tới các hàm controller tương ứng 
1. Route: router.post("/signup", signup)
- Mục đích: Chỉ định rằng mọi request POST đến /api/auth/signup sẽ được xử lý bởi hàm signup.
- Input: Request POST với body chứa FullName, Email, Password.
- Output: Chuyển giao request và response cho hàm signup trong auth.controller.js.

2. Route: router.post("/login", login)
- Mục đích: Chỉ định rằng mọi request POST đến /api/auth/login sẽ được xử lý bởi hàm login.
- Input: Request POST với body chứa Email, Password.
- Output: Chuyển giao request và response cho hàm login trong auth.controller.js.
3. Route: router.post("/logout", logout)
- Mục đích: Chỉ định rằng mọi request POST đến /api/auth/logout sẽ được xử lý bởi hàm logout.
- Input: Request POST (thường không cần body, nhưng yêu cầu phải có cookie jwt để đăng xuất).
- Output: Chuyển giao request và response cho hàm logout trong auth.controller.js.
4. Route: router.get("/check", protectRoute, checkAuth)
- Mục đích: Chỉ định rằng mọi request GET đến /api/auth/check phải đi qua 2 bước:Chạy middleware protectRoute (để kiểm tra xem đã đăng nhập chưa).Nếu protectRoute thành công, chạy hàm checkAuth.
- Input: Request GET với cookie jwt hợp lệ.
- Output: Chuyển giao request cho protectRoute, sau đó là checkAuth.

File auth.controller.js: Chứa các luồng, quyết định xem sẽ làm gì khi nhận được một request từ user
1. Hàm signup
- Mô tả: Nhận FullName, Email, Password từ req.body. Kiểm tra xem các trường có trống không, mật khẩu có đủ độ dài hợp lệ(6 kí tự). Kiểm tra Email tồn tại bởi findByEmail. Mã hóa bởi brypt. Tạo người dùng mới trong CSDL và khi tạo thành công thì tạo 1 JWT và set cookie bởi generateToken
- Input: req (chứa req.body) và res.
{
	"FullName": "Hoang",
    "Email": "hoang2123@email.com",
    "Password": "123456"
}
- Output:Thành công: JSON (status 201) chứa thông tin user (trừ mật khẩu) và set cookie jwt cho client.Thất bại: JSON (status 400 hoặc 500) với thông báo lỗi .
     - Output thành công: 
{
    "UserID": 5
}
     - Output thất bại(Mật khẩu nhỏ hơn 6 kí tự - 400 Bad Request)
{
    "message": "Password must be at least 6 characters long."
}
     - Output thất bại(Trùng Email - 400 Bad Request)
{
    "message": "Email is already registered."
}
     - Output thất bại(Chưa điền Password/Email/Tên người dùng - 400 Bad Request)
{
    "message": "All fields are required."
}

2. Hàm login
- Mô tả: Nhận Email, Password từ req.body, tìm CSDL bằng email(Không thấy user thì trả lỗi invalid). So sánh mật khẩu client gửi với mật khẩu đã hash, đúng thì tạo JWT và set cookie bởi generateToken
- Input: req (chứa req.body) và res.
{
	"Email": "hoang123@email.com",
    "Password": "123456"
}
- Output:Thành công: JSON (status 200) chứa thông tin user và set cookie jwt. Thất bại: JSON (status 400 hoặc 500) với thông báo lỗi.
- Output thành công:
{
    "UserID": 4,
    "FullName": "Hoang",
    "Email": "hoang123@email.com",
    "ProfilePic": ""
}
- Output thất bại:(Sai tên đăng nhập hoặc mật khẩu - 400 Bad Request)
{
    "message": "Invalid email or password."
}

3. Hàm logout
- Mô tả:Xóa cookie jwt của client bằng cách set một cookie mới cùng tên (jwt) nhưng có maxAge: 0 (hết hạn ngay lập tức).
- Input: req và res.
- Output: JSON (status 200) với thông báo "Logged out successfully." và xóa cookie trên trình duyệt client.
{
    "message": "Logged out successfully."
}
4. checkAuth
- Mô tả: Hàm này chỉ chạy sau khi protectRoute (middleware) đã chạy thành công. protectRoute đã xác thực token và lấy thông tin user đính kèm vào req.user sau đó trả về client
- Input: req (đã được middleware xử lý và chứa req.user thực chất là truyền UserId).
- Output: JSON (status 200) chứa thông tin user (ID, Email, FullName).
- Output thành công:
{
    "UserID": 4,
    "Email": "hoang123@email.com",
    "FullName": "Hoang"
}

File auth.middleware.js: Đại khái như 1 hàm trung gian giữa request của client và controller(Đảm bảo rằng người dùng đã đăng nhập mới được thực hiện các tác vụ)
- Mô tả: Lấy chuỗi token từ req.cookies.jwt. Nếu không có token thì chặn request, có thì giải mã token bởi jwt.verify và JWT_SECRET. Token không hợp lệ(báo lỗi), hợp lệ thì lấy userId trong csdl. nếu không thấy user thì chặn request, nếu thấy thì gán vào req.user và gọi next() để cho phép đi tiếp đến controller
- Input: req, res, và hàm next (để gọi khi thành công).
- Output: Thành công: Gọi next() và sửa đổi req để thêm req.user. Thất bại: Trả về JSON (status 401) với thông báo lỗi "Unauthorized".

File utils.js: Chứa hàm generateToken, có thể tạo JSON Web Token và thiết lập làm cookie bảo mật
- Mô tả: Tạo 1 token bằng jwwt.sign, phần payload chỉ chứa userID. Token này được ký bằng prrocess.env.JWT.SECRET và hạn 7 ngày( hết 7 ngày thì phải reset này). Token này gán vào res dưới dạng cookie và các flag quan trọng
     - httpOnly: true: Ngăn JS phía client đọc cookie
     - sameSite: "strict": Ngăn trình duyệt gửi cookie khi điều hướng từ trang web khác
     - secure: Chỉ gửi cookie qua https nếu không khải môi trường "development"
- Input: userId (ID của người dùng) và res (đối tượng response).
- Output: Trả về chuỗi token và thay đổi (mutate) res bằng cách thêm cookie

File user_auth_model.js: Dùng để kết nối với CSDL(User)
- User.create: ghi thông tin người dùng vào bảng với các tham số Email, Fullnam, Password, ProfilePic(cái này chưa kịp làm =)))), Trả về 1 đối tượng
- User.getAll: Lấy tất cả thông tin từ Users, trả về các đối tượng
- User.findByEmail: Tìm người dùng duy nhất bằng cột Email 



1. Nhóm API Thông báo (Notification)
- a. Lấy danh sách thông báo
- Method & Endpoint: GET /api/notifications ?page=x&limit=y(với x và y là muốn ở trang mấy và lấy bnh trong trang đó)
- Quyền hạn: User đã đăng nhập (protectRoute).
- Đầu vào (Input):
- Headers: Authorization: Bearer <token> (Token xác thực người dùng).
- Đầu ra (Output):
T- hành công (200): Mảng JSON chứa danh sách thông báo. Mỗi phần tử bao gồm: NotificationID, Title, Content, CreatedAt và UserID (ID người nhận, nếu để là null thì gửi cho toàn bộ).
- Lỗi (500): { message: "Server error" }.
- Tác dụng: Cho phép cư dân/người dùng xem các thông báo mới nhất từ ban quản lý (sắp xếp mới nhất lên đầu).

- b. Gửi thông báo mới
- Method & Endpoint: POST /api/notifications
- Quyền hạn: Chỉ Admin (requireAdmin).
- Đầu vào (Input):
- Headers: Authorization: Bearer <token> (Token của Admin).
- Body (JSON):
- JSON
{
  "title": "Thông báo cắt nước",
  "content": "Sẽ cắt nước từ 8h đến 17h ngày..."
}
- Đầu ra (Output):
- Thành công (201): Object thông báo vừa tạo (dữ liệu lấy từ DB sau khi insert).
- Lỗi (400): Thiếu title hoặc content.
- Lỗi (500): Server error.
- Tác dụng: Giúp Ban quản lý (Admin) gửi thông báo chung đến toàn bộ hệ thống.


2. Nhóm API Nạp tiền (TopUp)
- File liên quan: topup.routes.js, topup_model.js, setupDB.sql
- a. Tạo giao dịch nạp tiền
- Method & Endpoint: POST / 
- Đầu vào (Input):
- Body (JSON):
- JSON
{
  "UserID": 123,
  "Amount": 500000,
  "Status": "Pending",  // Tùy chọn, mặc định là Pending hoặc Completed tùy logic
  "CreatedAt": "2025-11-20..." // Tùy chọn
}
- Đầu ra (Output):
- Thành công: { success: true, data: { TopUpID: ... } }
- Tác dụng: Người dùng tạo yêu cầu nạp tiền vào ví điện tử trong hệ thống (để sau này trừ tiền dịch vụ).

- b. Lấy tất cả lịch sử nạp tiền
- Method & Endpoint: GET /
- Đầu vào (Input): Không có (hoặc query params nếu mở rộng sau này).
- Đầu ra (Output):
- Mảng JSON danh sách tất cả giao dịch nạp tiền, kèm theo FullName của người nạp (Join với bảng Users).
- Tác dụng: Admin xem toàn bộ lịch sử nạp tiền của hệ thống để đối soát doanh thu.

- c. Lấy lịch sử nạp tiền theo User
- Method & Endpoint: GET /user/:id 
- Đầu vào (Input):
- id: ID của User cần xem .
- Đầu ra (Output):
- Mảng JSON danh sách các giao dịch nạp tiền của riêng user đó.
- Tác dụng: Hiển thị lịch sử nạp tiền tại màn hình cá nhân của cư dân.

- d. Cập nhật trạng thái nạp tiền
- Method & Endpoint: PATCH /:id/status
- Đầu vào (Input):
- id: TopUpID (trên URL).
- Body: { "Status": "Completed" } (hoặc "Failed").
- Đầu ra (Output): { success: true }
- Tác dụng: Admin duyệt yêu cầu nạp tiền. Ví dụ: Khách chuyển khoản ngân hàng -> Admin kiểm tra -> Gọi API này để chuyển trạng thái từ 'Pending' sang 'Completed'.

3. Nhóm API Thanh toán Dịch vụ (Payment/ServicePayment)
- a. Tạo hóa đơn/thanh toán mới
- Method & Endpoint: POST / 
- Đầu vào (Input):
- Body (JSON):
- JSON
{
  "UserID": 123,
  "ServiceName": "Tiền điện tháng 11",
  "Description": "120kWh",
  "Amount": 245000,
  "Status": "Paid"
}
- Đầu ra (Output):
- Thành công: { success: true, data: { PaymentID: ... } }
- Tác dụng: Hệ thống (hoặc Admin) tạo ra một bản ghi thanh toán. Ví dụ: Cuối tháng chốt số điện và trừ tiền trong ví của User, sau đó gọi API này để lưu lại lịch sử "Đã thanh toán tiền điện".

- b. Lấy tất cả lịch sử thanh toán
- Method & Endpoint: GET /
- Đầu vào (Input): Không.
- Đầu ra (Output):
- Mảng JSON chứa tất cả hóa đơn dịch vụ, kèm FullName của người dùng.
- Tác dụng: Admin quản lý, thống kê xem tháng này đã thu được những khoản phí nào.

- c. Lấy lịch sử thanh toán theo User
- Method & Endpoint: GET /user/:id
- Đầu vào (Input): id (UserID).
- Đầu ra (Output):
- Mảng JSON danh sách hóa đơn của user đó.
- Tác dụng: Cư dân xem lại lịch sử chi tiêu (tiền điện, nước, phí gửi xe...) của chính mình.

4. API feedback
- a. API gửi phản hồi từ người dùng
- Method & Endpoint: POST /api/feedbacks
- Đầu vào (Input):
- Body(JSON): 
{
	"title": "Khiếu nại tiền điện",
    "content": "test"
}
- Đầu ra:
- Trường hợp thành công
{
  "success": true,
  "message": "Feedback submitted successfully",
  "feedback": {
    "FeedbackID": 8
  }
}
- Trường hợp lỗi (HTTP 400 - Thiếu dữ liệu)
{
  "message": "Title and content are required"
}

- b.API lấy danh sách phản hồi(Dành cho Admin xem toàn bộ phản hồi từ người dùng kèm theo thông tin chi tiết)
- Method: GET (http://localhost:3000/api/feedbacks?page=x&limit=y)(phân trang)
- Đầu vào (Input):
- Body(JSON): Không
- Đầu ra:
- Trường hợp thành công HTTP 200
Mảng JSON chứa danh sách các thông báo của User
{
    "success": true,
    "count": 8,
    "data": [
        {
            "FeedbackID": 8,
            "UserID": 1,
            "Title": "Khiếu nại tiền điện",
            "Content": "test",
            "Status": "Pending",
            "CreatedAt": "2025-12-31T00:53:39.170Z",
            "FullName": "Test4",
            "Email": "test3@example.com",
            "studentID": "20235421"
        },
        {
            "FeedbackID": 7,
            "UserID": 1,
            "Title": "Khiếu nại tiền điện",
            "Content": "test",
            "Status": "Pending",
            "CreatedAt": "2025-12-31T00:53:22.130Z",
            "FullName": "Test4",
            "Email": "test3@example.com",
            "studentID": "20235421"
        },
        {
            "FeedbackID": 6,
            "UserID": 3,
            "Title": "Khiếu nại tiền điện",
            "Content": "test",
            "Status": "Pending",
            "CreatedAt": "2025-12-29T00:12:31.500Z",
            "FullName": "Test",
            "Email": "test@example.com",
            "studentID": "20235429"
        },
        {
            "FeedbackID": 5,
            "UserID": 3,
            "Title": "Khiếu nại tiền điện",
            "Content": "Trả tiền điện như muối bỏ biển, đầu tư vào hdpe thì ngon luôn",
            "Status": "Pending",
            "CreatedAt": "2025-12-29T00:10:22.440Z",
            "FullName": "Test",
            "Email": "test@example.com",
            "studentID": "20235429"
        },
        {
            "FeedbackID": 4,
            "UserID": 3,
            "Title": "Khiếu nại tiền điện",
            "Content": "Trả tiền điện như muối bỏ biển, đầu tư vào hdpe thì ngon luôn",
            "Status": "Pending",
            "CreatedAt": "2025-12-29T00:07:39.197Z",
            "FullName": "Test",
            "Email": "test@example.com",
            "studentID": "20235429"
        },
        {
            "FeedbackID": 3,
            "UserID": 3,
            "Title": "Khiếu nại tiền điện",
            "Content": "Trả tiền điện như muối bỏ biển, đầu tư vào hdpe thì ngon luôn",
            "Status": "Pending",
            "CreatedAt": "2025-12-29T00:07:17.010Z",
            "FullName": "Test",
            "Email": "test@example.com",
            "studentID": "20235429"
        },
        {
            "FeedbackID": 2,
            "UserID": 3,
            "Title": "Khiếu nại tiền điện",
            "Content": "Trả tiền điện như muối bỏ biển, đầu tư vào hdpe thì ngon luôn",
            "Status": "Pending",
            "CreatedAt": "2025-12-29T00:06:33.890Z",
            "FullName": "Test",
            "Email": "test@example.com",
            "studentID": "20235429"
        },
        {
            "FeedbackID": 1,
            "UserID": 3,
            "Title": "Khiếu nại tiền điện",
            "Content": "Trả tiền điện như muối bỏ biển, đầu tư vào hdpe thì ngon luôn",
            "Status": "Pending",
            "CreatedAt": "2025-12-29T00:06:30.750Z",
            "FullName": "Test",
            "Email": "test@example.com",
            "studentID": "20235429"
        }
    ]
}
- Trường hợp lỗi: HTTP 403 - Không phải quyền admin
Output: 
{
    "message": "Forbidden - Admin access required"
}

5. Quản lý Người dùng (Users) - Chỉ dành cho Admin
- Yêu cầu chung: Header phải có Token của Admin (Cookie hoặc Bearer Token). Middleware: protectRoute, requireAdmin.

- a. Lấy danh sách người dùng (Có phân trang & Tìm kiếm)
- Route: GET /api/users
Input (Query Params):
- page: (Number, Optional) Trang hiện tại. Mặc định là 1.
- limit: (Number, Optional) Số lượng user mỗi trang. Mặc định là 10.
- search: (String, Optional) Từ khóa tìm kiếm (Tên hoặc Email).
- Output (JSON):
- Thành công (200):
- JSON(với /api/users?page=x&limit=y)
{
    "success": true,
    "pagination": {
        "page": 1,
        "limit": 10,
        "totalRows": 50,
        "totalPages": 5
    },
    "data": [
        {
            "UserID": 3,
            "Email": "test@example.com",
            "FullName": "Test",
            "BirthDate": "2005-05-12T00:00:00.000Z",
            "StudentID": "20235429",
            "ID": "12324",
            "ProfilePic": "",
            "Role": "User"
        },
    ]
}
- JSON với /api/users?search=x
{
    "success": true,
    "message": "Found 2 results for \"test\"",
    "pagination": null,
    "data": [
        {
            "UserID": 3,
            "Email": "test@example.com",
            "FullName": "Test",
            "BirthDate": "2005-05-12T00:00:00.000Z",
            "StudentID": "20235429",
            "ID": "12324",
            "ProfilePic": "",
            "Role": "User"
        },
        {
            "UserID": 1,
            "Email": "test3@example.com",
            "FullName": "Test4",
            "BirthDate": "2005-05-12T00:00:00.000Z",
            "StudentID": "20235421",
            "ID": "12344",
            "ProfilePic": "",
            "Role": "Admin"
        }
    ]
}
- b. Xem chi tiết người dùng
- Route: GET /api/users/:id
- Input (Params):
- id: ID của user cần xem.
- Output (JSON):
- Thành công (200): Object thông tin User.
- Thất bại (404): { "message": "User not found" }.
- c. Tạo người dùng mới (Cấp tài khoản)
- Route: POST /api/users
- Input (Body JSON):
- FullName (Required): Họ tên.
- Email (Required): Email đăng nhập.
- Password (Required): Mật khẩu.
- BirthDate (Required): Ngày sinh (YYYY-MM-DD).
- StudentID (Required): Mã sinh viên.
- ID (Required): Số CCCD.
- Role: "Admin" hoặc "User" (Mặc định "User").
- Output (JSON):
- Thành công (201): { "message": "User created successfully", "data": {"UserID": } }.
- Thất bại (400): Lỗi thiếu trường hoặc Email đã tồn tại.

- d. Cập nhật thông tin người dùng
- Route: PUT /api/users/:id
- Input:
- Params: id (ID user cần sửa).
- Body JSON: FullName, BirthDate, StudentID, ID, Role (Các trường cần sửa).
- Output (JSON):
- Thành công (200): { "message": "User updated successfully" }.
- e. Xóa người dùng
- Route: DELETE /api/users/:id
- Input (Params): id (ID user cần xóa).
- Output (JSON):
- Thành công (200): { "message": "User deleted successfully" }.
- Thất bại (400): Không thể tự xóa chính mình.
- Thất bại (409): Lỗi ràng buộc khóa ngoại (User đã có giao dịch nạp tiền/thanh toán).

6. Quản lý Dịch vụ (Services)
- Quyền hạn:
- Xem (GET): User và Admin đều xem được.
- Thêm/Sửa/Xóa (POST, PUT, DELETE): Chỉ Admin.
- a. Lấy danh sách dịch vụ (Có phân trang)
- Route: GET /api/services?page=x&limit=y
- Input (Query Params):
- page: (Number) Mặc định 1.
- limit: (Number) Mặc định 10.
- Output (JSON):
- Thành công (200):
{
    "success": true,
    "pagination": {
        "page": 1,
        "limit": 5,
        "total": 7,
        "totalPages": 2
    },
    "data": [
        {
            "ServiceID": 7,
            "ServiceName": "Kiểm tra định kỳ 2",
            "Price": 80000,
            "Descriptions": "kiểm tra kiến trúc chung cư",
            "CreatedAt": "2025-12-29T21:40:51.700Z"
        },
    ]
}
- b. Tạo dịch vụ mới
- Route: POST /api/services
- Input (Body JSON):
- ServiceName (Required): Tên dịch vụ (Unique).
- Price (Required): Giá tiền.
- Descriptions: Mô tả chi tiết.
- Output (JSON):
- Thành công (201): { "success": true, "data": { "ServiceID": 8 } }.
- Thất bại (400): Thiếu tên hoặc giá.
- c. Cập nhật dịch vụ
- Route: PUT /api/services/:id
- Input:
- Params: id.
- Body JSON: ServiceName, Price, Descriptions.
- Output (JSON):
- Thành công (200): { "success": true, "message": "Update completed" }.
- d. Xóa dịch vụ
- Route: DELETE /api/services/:id
- Input (Params): id.
- Output (JSON):
- Thành công (200): { "success": true, "message": "Delete completed" }.
- Thất bại (409): Lỗi nếu dịch vụ này đã có trong lịch sử thanh toán (Ràng buộc khóa ngoại).

7. Nhóm API thanh toán
- a. Xem danh sách hóa đơn chưa thanh toán
- Route: GET /api/payments/unpaid
- Input: Token chứa UserID của người đăng nhập
- Output:
{
    "success": true,
    "count": 2,
    "data": [
        {
            "BillID": 6,
            "ServiceName": "Phí gửi xe máy",
            "Period": "11/2025",
            "Amount": 80000,
            "RoomID": null,
            "UserID": 3,
            "Price": 80000
        },
        {
            "BillID": 5,
            "ServiceName": "Tiền điện",
            "Period": "11/2025",
            "Amount": 360000,
            "RoomID": 101,
            "UserID": null,
            "Price": 360000
        }
    ]
}
- b.Thực hiện thanh toán(Giao dịch chính) - Khi 1 user trong phòng thanh toán dịch vụ chung thành công thì tất cả thành viên trong phòng đều sẽ được chuyển trạng thái
- Route: POST /api/payments/pay-bills
- Input: Header: Token (Xác định ai là người trả tiền). Body: Danh sách ID muốn trả. VD: {"billIds": [1, 2]}
- Output: 
{
    "success": true,
    "message": "Bills paid successfully",
    "data": {
        "success": true,
        "paymentId": 4,
        "totalPaid": 440000,
        "paidBillsCount": 2
    }
}
- c.Xem lịch sử thanh toán(Người dùng)
- Route:  GET /api/payments/history
- Input: Header: Token. Query Param: page=1, limit=10
- Output
{
    "success": true,
    "pagination": {
        "page": 1,
        "limit": 10,
        "totalRows": 4,
        "totalPages": 1
    },
    "data": [
        {
            "PaymentID": 4,
            "TotalAmount": 440000,
            "Status": "Paid",
            "CreatedAt": "2026-01-02T22:50:42.790Z",
            "ServicesNames": "Tiền điện, Phí gửi xe máy",
            "BillsCount": 2
        },
        {
            "PaymentID": 3,
            "TotalAmount": 440000,
            "Status": "Paid",
            "CreatedAt": "2026-01-02T22:03:40.773Z",
            "ServicesNames": "Tiền điện, Phí gửi xe máy",
            "BillsCount": 2
        },
        {
            "PaymentID": 2,
            "TotalAmount": 440000,
            "Status": "Paid",
            "CreatedAt": "2026-01-02T21:44:26.360Z",
            "ServicesNames": null,
            "BillsCount": 0
        },
        {
            "PaymentID": 1,
            "TotalAmount": 440000,
            "Status": "Paid",
            "CreatedAt": "2026-01-02T18:55:36.410Z",
            "ServicesNames": null,
            "BillsCount": 0
        }
    ]
}
- d. Xem lịch sử thanh toán(Admin)
- Route: POST api/payments/admin/history?search=name(or email)
- Input: Header: Token, Query param: page =1, limit = 10, search =
- Output
{
    "success": true,
    "pagination": {
        "page": 1,
        "limit": 10,
        "totalRows": 4,
        "totalPages": 1
    },
    "data": [
        {
            "PaymentID": 4,
            "TotalAmount": 440000,
            "Status": "Paid",
            "CreatedAt": "2026-01-02T22:50:42.790Z",
            "FullName": "Test",
            "RoomID": 101,
            "ServiceNames": "Tiền điện, Phí gửi xe máy"
        },
        {
            "PaymentID": 3,
            "TotalAmount": 440000,
            "Status": "Paid",
            "CreatedAt": "2026-01-02T22:03:40.773Z",
            "FullName": "Test",
            "RoomID": 101,
            "ServiceNames": "Tiền điện, Phí gửi xe máy"
        },
        {
            "PaymentID": 2,
            "TotalAmount": 440000,
            "Status": "Paid",
            "CreatedAt": "2026-01-02T21:44:26.360Z",
            "FullName": "Test",
            "RoomID": 101,
            "ServiceNames": null
        },
        {
            "PaymentID": 1,
            "TotalAmount": 440000,
            "Status": "Paid",
            "CreatedAt": "2026-01-02T18:55:36.410Z",
            "FullName": "Test",
            "RoomID": 101,
            "ServiceNames": null
        }
    ]
}