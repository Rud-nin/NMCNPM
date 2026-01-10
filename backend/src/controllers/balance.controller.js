import UserBalance from '../models/userBalance.model.js'

// @route GET /api/balances
export const getMyBalance = async (req, res) => {
  try {
    const balance = await UserBalance.getUserBalance(req.user.UserID)
    res.status(200).json({
      success: true,
      data: balance || {
        UserID: req.user.UserID,
        Balance: 0,
      },
    })
  } catch (error) {
		console.log("Get my balance error: ", error);

		res.status(500).json({
			success: false,
			message: "Server error"
		});
	}
}
