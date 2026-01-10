import { TopUp } from "../models/topup.model.js"

// @route POST /api/topups
export const createTopUp = async (req, res) => {
	try {
		const { Amount } = req.body

		const data = await TopUp.create({
			UserID: req.user.UserID,
			Amount
		})

		res.status(201).json({
			success: true,
			data
		})
	} catch (error) {
		console.log("Create topUp error: ", error);

		res.status(500).json({
			success: false,
			message: "Server error"
		});
	}
}

// @route GET /api/topups (admin)
export const getAllTopUps = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1
		const limit = parseInt(req.query.limit) || 10

		const { data, totalRows } = await TopUp.getAll({ page, limit })

		res.json({
			success: true,
			pagination: {
				page,
				limit,
				totalRows,
				totalPages: Math.ceil(totalRows / limit)
			},
			data
		})
	} catch (error) {
		console.log("Get all topUp error: ", error);

		res.status(500).json({
			success: false,
			message: "Server error"
		});
	}
}

// @route GET /api/topups/me
export const getMyTopUps = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1
		const limit = parseInt(req.query.limit) || 10

		const { data, totalRows } = await TopUp.getByUser(req.user.UserID, { page, limit })

		res.json({
			success: true,
			pagination: {
				page,
				limit,
				totalRows,
				totalPages: Math.ceil(totalRows / limit)
			},
			data
		})
	} catch (error) {
		console.log("Get my topUp error: ", error);

		res.status(500).json({
			success: false,
			message: "Server error"
		});
	}
}

// @route PATCH /api/topups/:id/accept
export const acceptTopUp = async (req, res) => {
	try {
		const topUp = await TopUp.findById(req.params.id);
		
		if (!topUp || topUp.Status !== "Pending") {
			return res.status(400).json({
				success: false,
				message: "Top-up không hợp lệ hoặc đã xử lý"
			});
		}

		await TopUp.acceptTopUp(req.params.id)
		res.json({ success: true })
	} catch (error) {
		console.log("Accept topUp error: ", error);

		res.status(500).json({
			success: false,
			message: "Server error"
		});
	}
}

// @route PATCH /api/topups/:id/reject
export const rejectTopUp = async (req, res) => {
	try {
		const topUp = await TopUp.findById(req.params.id);
		
		if (!topUp || topUp.Status !== "Pending") {
			return res.status(400).json({
				success: false,
				message: "Top-up không hợp lệ hoặc đã xử lý"
			});
		}

		await TopUp.rejectTopUp(req.params.id, req.body.reason || "")
		res.json({ success: true })
	} catch (error) {
		console.log("Reject topUp error: ", error);

		res.status(500).json({
			success: false,
			message: "Server error"
		});
	}
}
