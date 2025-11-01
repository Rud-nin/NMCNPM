import { User } from "../models/user_auth_model.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { FullName, Email, Password } = req.body;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!FullName || !Email || !Password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (Password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    //Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findByEmail(Email);
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    //Mã hoá mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    //Tạo user trong DB
    const newUser = await User.create({
      FullName,
      Email,
      Password: hashedPassword,
    });


    // Sinh token và trả về client
    if (newUser) {
      generateToken(newUser.UserID, res);
      return res.status(201).json({
        UserID: newUser.UserID,
        FullName: newUser.FullName,
        Email: newUser.Email,
        ProfilePic: newUser.ProfilePic,
      });
    } else {
      return res.status(400).json({ message: "Invalid user data." });
    }
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

export const login = async (req, res) => {
  const { Email, Password } = req.body;
  try {
    const user = await User.findByEmail(Email);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const isMatch = await bcrypt.compare(Password, user.Password);
    if(!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    generateToken(user.UserID, res);
    return res.status(200).json({
      UserID: user.UserID,
      FullName: user.FullName,
      Email: user.Email,
      ProfilePic: user.ProfilePic,

    });

  } catch (error){
    console.error("Error in login controller:", error.message);
    res.status(500).json({ message: "Internal Server Error."});
  }
};

export const logout = (req, res) => {
  try{
    res.cookie("jwt","", {maxAge: 0});
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error){
    console.error("Error in logout controller:", error.message);
    res.status(500).json({ message: "Internal Server Error."});
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


