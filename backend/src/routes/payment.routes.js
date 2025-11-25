import express from 'express'
import { ServicePayment } from '../models/payment_model.js'

const router = express.Router()

// Create payment
router.post('/', async (req, res) => {
  try {
    const data = await ServicePayment.create(req.body)
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Get all payments
router.get('/', async (req, res) => {
  try {
    const data = await ServicePayment.getAll()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get payments by user
router.get('/user/:id', async (req, res) => {
  try {
    const data = await ServicePayment.getByUser(req.params.id)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
