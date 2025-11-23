import { Notification } from "../models/notification_model.js";

//Gửi thông báo (Chỉ dành cho Admin)
//route POST  /api/notifications

export const sendNotification = async (req, res) => {
    const {title, content} = req.body;

    if(!title || !content){
        return res.status(400).json({message: "Title and content are required"});
    }

    try {
        const newNotification = await Notification.create({
            title,
            content,
            adminId: req.user.UserID
        });
        res.status(201).json(newNotification);

    } catch (error){
        console.error("Error sending notification:", error);
        res.status(500).json({message: "Server error"});
    }
};

//Lấy danh sách thông báo
//route: GET  /api/notifications

export const getNotifications = async (req,res) => {
    try {
        const list = await Notification.getAll();
        res.status(200).json(list);
    } catch(error) {
        console.error("Error fetching notification:", error);
        res.status(500).json({message: "Server error"});
    }
}