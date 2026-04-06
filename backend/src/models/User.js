const mongoose = require('mongoose');

const MODEL_NAME = 'KervSalesDemoUser';

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
    role: {
      type: String,
      default: 'user',
      trim: true,
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
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

module.exports = mongoose.models[MODEL_NAME] || mongoose.model(MODEL_NAME, userSchema);
