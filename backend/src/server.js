import express from 'express'
import cors from 'cors'
import authRoutes from '../src/routes/auth.routes.js'
import cookieParser from 'cookie-parser'
import notificationRoutes from '../src/routes/notification.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import topupRoutes from './routes/topup.routes.js'
import feedbackRoutes from './routes/feedback.routes.js'
import serviceRoutes from './routes/service.routes.js'
import userRoutes from './routes/user.routes.js'
import billRoutes from './routes/bill.routes.js'
import roomRoutes from "./routes/room.routes.js";
import roomRequestRoutes from "./routes/roomRequest.routes.js";
import balanceRoutes from './routes/balance.routes.js'

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Fallback nếu quên .env
    credentials: true, // Cho phép gửi cookie
  })
)

app.use('/api/auth', authRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/topups', topupRoutes)
app.use('/api/feedbacks', feedbackRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/users', userRoutes)
app.use('/api/bills', billRoutes)
app.use("/api/rooms", roomRoutes);
app.use("/api/room-requests", roomRequestRoutes);
app.use("/api/balances", balanceRoutes);

app.listen(process.env.PORT, () => {
  console.log('server is running on port', process.env.PORT)
})
