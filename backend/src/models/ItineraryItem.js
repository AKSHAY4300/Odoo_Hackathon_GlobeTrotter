const mongoose = require('mongoose');

const itineraryItemSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip ID is required'],
      index: true,
    },
    stopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop',
      required: [true, 'Stop ID is required'],
      index: true,
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      required: [true, 'Activity ID is required'],
      index: true,
    },
    title: {
      type: String,
    },
    category: {
      type: String,
      enum: ['culture', 'food', 'adventure', 'sightseeing', 'transport', 'relaxation'],
      default: 'culture',
    },
    scheduledDate: {
      type: String,
      required: [true, 'Scheduled date is required'],
    },
    scheduledTime: {
      type: String,
      default: '10:00',
    },
    durationMinutes: {
      type: Number,
      default: 60,
    },
    costOverride: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const ItineraryItem = mongoose.model('ItineraryItem', itineraryItemSchema);
module.exports = ItineraryItem;
