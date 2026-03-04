import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    tokenExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

userSchema.methods.isTokenExpired = function () {
  if (!this.tokenExpiry) return true
  return new Date() >= this.tokenExpiry
}

userSchema.methods.hasValidTokens = function () {
  return !!(this.accessToken || this.refreshToken)
}

const User = mongoose.model('User', userSchema)

export default User
