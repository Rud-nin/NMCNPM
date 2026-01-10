import { Feedback } from "../models/feedback.model.js";
import { Notification } from "../models/notification.model.js";
export const sendFeedback = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.UserID;
        if(!title ||!content) {
            return res.status(400).json({message: "Title and content are required"});

        }
        const newFeedback = await Feedback.create({
            userId,
            title,
            content
        });
        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            feedback: newFeedback
        });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.status(500).json({message: "Server error"});
    }
    
};

export const getAllFeedbacks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { feedbacks, totalCount } = await Feedback.getAll({ page, limit });
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json({
            success: true,
            pagination: {
                page: page,
                limit: limit,
                totalRows: totalCount,
                totalPages: totalPages
            },
            data: feedbacks
        });

    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        res.status(500).json({message: "Server error"});
    }
};

//@route PUT /api/feedbacks/:id/status
export const updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Pending', 'In Progress', 'Done'

        const validStatuses = ['Pending', 'In Progress', 'Done'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Status must be one of: Pending, In Progress, Done" });
        }

        const feedback = await Feedback.getById(id);
        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        const translated = {
            "Pending": "Đang chờ xử lý",
            "In Progress": "Đang xử lý",
            "Done": "Hoàn thành",
        };

        await Promise.all([
            Feedback.updateStatus(id, status),
            Notification.create({
                title: "Cập nhật trạng thái phản hồi",
                content: `Phản hồi "${feedback.Title}" của bạn đã cập nhật trạng thái thành: ${translated[status]}`,
                receiverId: feedback.UserID
            }),
        ]);

        res.status(200).json({ success: true, message: `Updated status to ${status}` });

    } catch (error) {
        console.error("Update feedback error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @route DELETE /api/feedbacks/:id
export const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.getById(id);
        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        // Xử lý Logic thông báo DỰA TRÊN TRẠNG THÁI HIỆN TẠI
        let notifTitle = "";
        let notifContent = "";
        let shouldNotify = false;

        if (feedback.Status === 'Pending') {
            // Pending -> Xóa = Từ chối
            shouldNotify = true;
            notifTitle = "Yêu cầu bị từ chối";
            notifContent = `Yêu cầu "${feedback.Title}" của bạn đã bị từ chối và xóa khỏi hệ thống.`;
        } else if (feedback.Status === 'In Progress') {
            // In Progress -> Xóa = Không thể hoàn thành
            shouldNotify = true;
            notifTitle = "Yêu cầu không được hoàn thành";
            notifContent = `Không may rằng, yêu cầu "${feedback.Title}" không thể được giải quyết và đã bị hủy.`;
        } else if (feedback.Status === 'Done') {
            // Done -> Xóa = Dọn dẹp -> Không thông báo
            shouldNotify = false;
        }

        await Promise.all([
            Feedback.delete(id),
            shouldNotify ? Notification.create({
                title: notifTitle,
                content: notifContent,
                receiverId: feedback.UserID
            }) : Promise.resolve(),
        ]);

        res.status(200).json({ success: true, message: "Feedback deleted successfully" });

    } catch (error) {
        console.error("Delete feedback error:", error);
        res.status(500).json({ message: "Server error" });
    }
};