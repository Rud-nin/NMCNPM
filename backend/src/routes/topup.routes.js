import express from 'express'
import { TopUp } from '../models/topup_model.js'

const router = express.Router()

// Create top-up
router.post('/', async (req, res) => {
  try {
    const data = await TopUp.create(req.body)
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Get all top-ups
router.get('/', async (req, res) => {
  try {
    const data = await TopUp.getAll()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get top-up by user
router.get('/user/:id', async (req, res) => {
  try {
    const data = await TopUp.getByUser(req.params.id)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update status
router.patch('/:id/status', async (req, res) => {
  try {
    await TopUp.updateStatus(req.params.id, req.body.Status)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
