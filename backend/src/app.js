require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const tenantRoutes = require('./routes/tenant.routes');
const userRoutes = require('./routes/user.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');

const db = require('./config/db'); // your database connection (Sequelize, pg, etc.)

const app = express();

/* ===================== CORS CONFIG ===================== */
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

/* ===================== BODY PARSER ===================== */
app.use(express.json()); // parse incoming JSON
app.use(express.urlencoded({ extended: true })); // optional: parse form data

/* ===================== REQUEST LOGGER ===================== */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Body:', req.body); // log request body for debugging
  next();
});

/* ===================== HEALTH CHECK ===================== */
app.get("/api/health", async (req, res) => {
  try {
    // Check database connection
    if (db.authenticate) {
      await db.authenticate();
    } else if (db.query) {
      await db.query("SELECT 1");
    }

    res.status(200).json({
      status: "ok",
      database: "connected"
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "error",
      database: "disconnected"
    });
  }
});

/* ===================== ROUTES ===================== */
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api', userRoutes);
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);

/* ===================== ROOT ===================== */
app.get("/", (req, res) => {
  res.send("🚀 Partnr Backend is running");
});

/* ===================== GLOBAL ERROR HANDLER ===================== */
app.use((err, req, res, next) => {
  console.error('🔥 ERROR:', err);
  res.status(500).json({
    success: false,
    message: err.message
  });
});

module.exports = app;
