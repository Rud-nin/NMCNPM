import express from 'express'
import authRoutes from '../src/routes/auth.routes.js'
import cookieParser from 'cookie-parser'
import notificationRoutes from '../src/routes/notification.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import topupRoutes from './routes/topup.routes.js'
import feedbackRoutes from './routes/feedback.routes.js'
import serviceRoutes from './routes/service.routes.js'
import userRoutes from './routes/user.routes.js'

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/topups', topupRoutes)
app.use('/api/feedbacks', feedbackRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/users', userRoutes)

app.listen(process.env.PORT, () => {
  console.log('server is running on port', process.env.PORT)
})
