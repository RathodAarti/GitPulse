import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import repoRoutes from './routes/repoRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import supportRoutes from './routes/supportRoutes.js'
import aiRoutes from './routes/aiRoutes.js'

import path from 'path'
import { fileURLToPath } from 'url'

// ── Load environment variables ───────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })

// ── Initialize Express application ──────────────────────────────
const app = express()
const PORT = process.env.PORT || 5000

// ── Global Middleware ────────────────────────────────────────────

// Enable CORS for the React client (Vite dev server on 5173)
app.use(
  cors({
    origin: function(origin, callback) {
      const allowed = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        process.env.FRONTEND_URL,
      ].filter(Boolean)
      // Also allow any onrender.com subdomain for flexibility
      if (!origin || allowed.includes(origin) || (origin && origin.endsWith('.onrender.com'))) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

// Parse incoming JSON payloads (limit 5MB for safety)
app.use(express.json({ limit: '5mb' }))

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }))

// ── API Route Matrices ───────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/repos', repoRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/support', supportRoutes)
app.use('/api/ai', aiRoutes)

// ── Health Check Endpoint ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GitPulse API is operational.',
    timestamp: new Date().toISOString(),
  })
})

// ── 404 Catch-All ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  })
})

// ── Global Error Handler ─────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled Error:', err.stack || err.message)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
  })
})

// ── Boot Sequence ────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB()

    // Start listening on the configured port
    app.listen(PORT, () => {
      console.log(`\n🚀 GitPulse API Server running on port ${PORT}`)
      console.log(`   Health check: http://localhost:${PORT}/api/health`)
      console.log(`   Environment:  ${process.env.NODE_ENV || 'development'}\n`)
    })
  } catch (error) {
    console.error('❌ Server boot failure:', error.message)
    process.exit(1)
  }
}

startServer()
