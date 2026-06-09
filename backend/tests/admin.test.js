import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import adminRoutes from '../routes/adminRoutes.js'
import supportRoutes from '../routes/supportRoutes.js'
import User from '../models/User.js'
import SupportQuery from '../models/SupportQuery.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use('/api/admin', adminRoutes)
app.use('/api/support', supportRoutes)

// Global Error Handler for tests
app.use((err, req, res, _next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
  })
})

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  })
}

describe('Administrative Panel and Support Ticket System', () => {
  let adminUser
  let regularUser
  let adminToken
  let regularToken
  let testQuery

  beforeAll(async () => {
    const url = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/gitpulse_test'
    await mongoose.connect(url)
  })

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase()
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    await User.deleteMany({})
    await SupportQuery.deleteMany({})

    // Create a designated admin user
    adminUser = await User.create({
      name: 'Aarti Rathod',
      email: 'agrathod0701@gmail.com',
      password: 'Aarti@0107',
    })
    adminToken = signToken(adminUser._id)

    // Create a regular user
    regularUser = await User.create({
      name: 'Regular Contributor',
      email: 'contributor@example.com',
      password: 'Password123',
    })
    regularToken = signToken(regularUser._id)

    // Create a test query
    testQuery = await SupportQuery.create({
      userId: regularUser._id,
      name: regularUser.name,
      email: regularUser.email,
      subject: 'Dashboard broken',
      message: 'The velocity chart is not rendering properly.',
    })
  })

  describe('POST /api/support', () => {
    it('should submit a support query successfully when authenticated', async () => {
      const res = await request(app)
        .post('/api/support')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          subject: 'Need help with PAT',
          message: 'My GitHub personal access token is not connecting.',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.query.subject).toBe('Need help with PAT')
    })

    it('should fail support query submission when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/support')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          subject: 'Need help with PAT',
          message: 'My GitHub personal access token is not connecting.',
        })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/admin/users', () => {
    it('should allow access to admin and return user list', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.users.length).toBe(2)
    })

    it('should block regular user access (403)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${regularToken}`)

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
    })
  })

  describe('PUT /api/admin/users/:id', () => {
    it('should allow admin to update user credentials', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
          email: 'newemail@example.com',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.user.name).toBe('Updated Name')
      expect(res.body.user.email).toBe('newemail@example.com')
    })

    it('should block admin from duplicating an existing email', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: adminUser.email,
        })

      expect(res.status).toBe(409)
      expect(res.body.success).toBe(false)
    })
  })

  describe('DELETE /api/admin/users/:id', () => {
    it('should block admin from deleting the primary admin account', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('safety interlock')
    })

    it('should allow admin to delete a regular user', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      
      const checkUser = await User.findById(regularUser._id)
      expect(checkUser).toBeNull()
    })
  })

  describe('GET /api/admin/queries', () => {
    it('should allow admin to retrieve support queries', async () => {
      const res = await request(app)
        .get('/api/admin/queries')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.queries.length).toBe(1)
    })
  })

  describe('PUT /api/admin/queries/:id', () => {
    it('should allow admin to toggle resolution status of support query', async () => {
      const res = await request(app)
        .put(`/api/admin/queries/${testQuery._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'resolved' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.query.status).toBe('resolved')
    })
  })

  describe('DELETE /api/admin/queries/:id', () => {
    it('should allow admin to clear a support query', async () => {
      const res = await request(app)
        .delete(`/api/admin/queries/${testQuery._id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const checkQuery = await SupportQuery.findById(testQuery._id)
      expect(checkQuery).toBeNull()
    })
  })
})
