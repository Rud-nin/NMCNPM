import express from 'express'
import { protectRoute } from '../midddleware/auth.middleware.js';
import { requireAdmin } from '../midddleware/admin.middleware.js';
import { payBills,getUnpaidBills,getPaymentHistory, getAdminPaymentHistory } from '../controllers/payment.controller.js';

const router = express.Router()

// Create payment
router.post('/pay-bills', protectRoute, payBills);
router.get('/unpaid-bills', protectRoute, getUnpaidBills);
router.get('/history', protectRoute, getPaymentHistory);
router.get('/admin/history', protectRoute, requireAdmin, getAdminPaymentHistory);
export default router
