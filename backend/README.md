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