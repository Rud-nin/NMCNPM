import express from "express";
import { getConnection } from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
const app = express();

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

app.use("/api/auth", authRoutes);