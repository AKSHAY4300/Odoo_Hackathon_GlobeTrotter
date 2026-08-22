const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
      index: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
      index: true,
    },
    costIndex: {
      type: Number,
      min: 1,
      max: 4,
      default: 2,
    },
    popularityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 90,
    },
    imageUrl: {
      type: String,
      required: [true, 'City image URL is required'],
    },
    description: {
      type: String,
      default: '',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    highlights: {
      type: [String],
      default: [],
    },
    bestTimeToVisit: {
      type: String,
      default: 'Year-round',
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

const City = mongoose.model('City', citySchema);
module.exports = City;
