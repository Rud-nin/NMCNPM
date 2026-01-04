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
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const { data, totalCount } = await TopUp.getAll({ page, limit })
    const totalPages = Math.ceil(totalCount / limit)
    res.json({
      success: true,
      pagination: {
        page: page,
        limit: limit,
        total: totalCount,
        totalPages: totalPages
      },
      data
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get top-up by user
router.get('/user/:id', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { data, totalCount } = await TopUp.getByUser(req.params.id, { page, limit });
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      pagination: {
        page: page,
        limit: limit,
        total: totalCount,
        totalPages: totalPages
      },
      data
    })
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
