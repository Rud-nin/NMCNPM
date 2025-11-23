import jwt from "jsonwebtoken";
import { User } from "../models/user_auth_model.js";
import { getConnection } from "../lib/db.js";


export const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }
        
        const pool = await getConnection();
        const result = await pool
            .request()  
            .input("UserID",decoded.userId)
            .query("SELECT UserID, Email, FullName, BirthDate, StudentID, ID, ProfilePic,Role FROM Users WHERE UserID = @UserID");
        const user = result.recordset[0];
        if(!user){
            return res.status(401).json({ message: "User Not Found" });
        }
    
        req.user = user;
        next();
        
    } catch (error){
        console.error("Error in protectRoute middleware:", error.message);
        return res.status(401).json({ message: "Unauthorized - Token Verification Failed" });
    }
};