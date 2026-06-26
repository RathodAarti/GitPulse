import mongoose from 'mongoose'

const accountActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN_SUCCESS',
        'LOGIN_FAILURE',
        'PROFILE_UPDATE',
        'PASSWORD_CHANGE',
        'PASSWORD_RESET',
        'DELETION_INITIATED',
        'DELETION_CANCELLED',
        'PERMANENT_DELETION',
        'SECURITY_QUESTION_UPDATE'
      ]
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    deviceInfo: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
)

const AccountActivity = mongoose.model('AccountActivity', accountActivitySchema)
export default AccountActivity
