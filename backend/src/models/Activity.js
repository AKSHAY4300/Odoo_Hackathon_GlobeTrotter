const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: [true, 'City ID is required'],
      index: true,
    },
    cityName: {
      type: String,
    },
    name: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['culture', 'food', 'adventure', 'sightseeing', 'transport', 'relaxation'],
      default: 'culture',
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    cost: {
      type: Number,
      min: 0,
      default: 0,
    },
    durationMinutes: {
      type: Number,
      min: 15,
      default: 60,
    },
    imageUrl: {
      type: String,
      required: [true, 'Activity image URL is required'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.8,
    },
    recommendedTime: {
      type: String,
      default: 'Morning',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret.customId || ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
