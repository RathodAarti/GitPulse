import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    githubToken: {
      type: String,
      default: null,
    },
    securityQuestion: {
      type: String,
      default: null,
    },
    securityAnswer: {
      type: String,
      default: null,
      select: false, // never returned by default
    },
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  }
  // Hash security answer if modified
  if (this.isModified('securityAnswer') && this.securityAnswer) {
    const salt = await bcrypt.genSalt(10)
    this.securityAnswer = await bcrypt.hash(
      this.securityAnswer.toLowerCase().trim(),
      salt
    )
  }
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.compareSecurityAnswer = async function (candidateAnswer) {
  if (!this.securityAnswer) return false
  return bcrypt.compare(candidateAnswer.toLowerCase().trim(), this.securityAnswer)
}

const User = mongoose.model('User', userSchema)
export default User
