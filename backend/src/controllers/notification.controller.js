import { Notification } from "../models/notification_model.js";

//Gửi thông báo (Chỉ dành cho Admin)
//route POST  /api/notifications

export const sendNotification = async (req, res) => {
    const {title, content, receiverId} = req.body;

    if(!title || !content){
        return res.status(400).json({message: "Title and content are required"});
    }

    try {
        const newNotification = await Notification.create({
            title,
            content,
            receiverId: receiverId || null
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
        const currentUserId = req.user.UserID;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if(page<1 || limit < 1) {
            return res.status(400).json({message: "Invalid page or limit"});
        }
        const {notifications, totalCount} = await Notification.getForUser(currentUserId, page, limit);
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json({
            success: true,
            pagination: {
                page: page,
                limit: limit,
                totalRows: totalCount,
                totalPages: totalPages
            },
            data: notifications
        });
    } catch(error) {
        console.error("Error fetching notification:", error);
        res.status(500).json({message: "Server error"});
    }
}