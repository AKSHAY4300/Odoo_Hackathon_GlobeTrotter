const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Trip name/title is required'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    coverPhotoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: String,
      required: [true, 'End date is required'],
    },
    targetBudget: {
      type: Number,
      default: 2500,
      min: 0,
    },
    dailySpendThreshold: {
      type: Number,
      default: 250,
      min: 0,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    shareId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'in_progress', 'completed'],
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        ret.coverImageUrl = ret.coverPhotoUrl;
        ret.title = ret.title || ret.name;
        ret.name = ret.name || ret.title;
        delete ret.__v;
        return ret;
      },
    },
  }
);

tripSchema.pre('save', function (next) {
  if (this.name && !this.title) {
    this.title = this.name;
  } else if (this.title && !this.name) {
    this.name = this.title;
  }
  next();
});

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;
