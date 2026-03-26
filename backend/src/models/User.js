const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
      default: 'Warner Bro.',
    },
    access: {
      type: [String],
      default: ['Search Tool'],
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
