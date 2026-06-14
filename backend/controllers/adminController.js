import User from '../models/User.js'
import Repository from '../models/Repository.js'
import AnalyticsCache from '../models/AnalyticsCache.js'
import SupportQuery from '../models/SupportQuery.js'

/**
 * Get all registered users and their repository tracking count
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password')
    const usersWithRepos = await Promise.all(
      users.map(async (u) => {
        const repoCount = await Repository.countDocuments({ ownerId: u._id })
        return {
          ...u.toObject(),
          repoCount,
        }
      })
    )
    res.status(200).json({ success: true, users: usersWithRepos })
  } catch (error) {
    console.error('Admin getUsers Error:', error.message)
    res.status(500).json({ success: false, message: 'Failed to fetch user directory.' })
  }
}

/**
 * Edit a user's details (Email and Name)
 */
export const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' })
    }

    // Ensure we don't duplicate emails
    if (email && email.toLowerCase().trim() !== user.email) {
      const duplicate = await User.findOne({ email: email.toLowerCase().trim() })
      if (duplicate) {
        return res.status(409).json({ success: false, message: 'Email address is already in use.' })
      }
      user.email = email.toLowerCase().trim()
    }

    if (name) user.name = name.trim()
    await user.save()

    res.status(200).json({
      success: true,
      message: 'User details updated successfully.',
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        githubToken: user.githubToken,
      },
    })
  } catch (error) {
    console.error('Admin updateUser Error:', error.message)
    res.status(500).json({ success: false, message: 'Failed to update user profile.' })
  }
}

/**
 * Delete a user and scrub all repositories + cache databases
 */
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id

    const userToDelete = await User.findById(userId)
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User account not found.' })
    }

    // Security check: Admin cannot delete their own profile
    if (userToDelete.email === 'agrathod0701@gmail.com') {
      return res.status(400).json({
        success: false,
        message: 'Administrative safety interlock: The primary admin account cannot be deleted.',
      })
    }

    // Find all repositories owned by this user
    const userRepos = await Repository.find({ ownerId: userId })
    const repoIds = userRepos.map((r) => r._id)

    // Delete associated caches
    await AnalyticsCache.deleteMany({ repoId: { $in: repoIds } })

    // Delete repositories
    await Repository.deleteMany({ ownerId: userId })

    // Delete user
    await User.findByIdAndDelete(userId)

    res.status(200).json({
      success: true,
      message: `User account "${userToDelete.name}" and all associated metrics/caches deleted successfully.`,
    })
  } catch (error) {
    console.error('Admin deleteUser Error:', error.message)
    res.status(500).json({ success: false, message: 'Failed to delete user and associated assets.' })
  }
}

/**
 * Retrieve all support message tickets
 */
export const getSupportQueries = async (req, res) => {
  try {
    const queries = await SupportQuery.find({}).sort({ createdAt: -1 })
    res.status(200).json({ success: true, queries })
  } catch (error) {
    console.error('Admin getSupportQueries Error:', error.message)
    res.status(500).json({ success: false, message: 'Failed to retrieve support queries.' })
  }
}

/**
 * Update the resolution status of a support query
 */
export const resolveSupportQuery = async (req, res) => {
  try {
    const { status } = req.body
    const query = await SupportQuery.findById(req.params.id)

    if (!query) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' })
    }

    if (status) query.status = status
    await query.save()

    res.status(200).json({
      success: true,
      message: 'Support ticket status updated.',
      query,
    })
  } catch (error) {
    console.error('Admin resolveSupportQuery Error:', error.message)
    res.status(500).json({ success: false, message: 'Failed to update support ticket.' })
  }
}

/**
 * Delete a support ticket
 */
export const deleteSupportQuery = async (req, res) => {
  try {
    const query = await SupportQuery.findByIdAndDelete(req.params.id)
    if (!query) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' })
    }
    res.status(200).json({ success: true, message: 'Support ticket cleared successfully.' })
  } catch (error) {
    console.error('Admin deleteSupportQuery Error:', error.message)
    res.status(500).json({ success: false, message: 'Failed to clear support ticket.' })
  }
}
