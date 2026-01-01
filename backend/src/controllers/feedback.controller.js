import { Feedback } from "../models/feedback_model.js";
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