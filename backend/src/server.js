import express from "express";
import { getConnection } from "./lib/db.js";
import authRoutes from "../src/routes/auth.routes.js";
import cookieParser from "cookie-parser";
import notificationRoutes from "../src/routes/notification.routes.js"

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.get('/', (req, res) => {
  return res.json("BACKEND");
});


app.get("/users", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM Users");
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).send("Server error");
  }
});

app.listen(process.env.PORT, () => {
  console.log("server is running on port", process.env.PORT);
});

