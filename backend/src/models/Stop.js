const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip ID is required'],
      index: true,
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: [true, 'City ID is required'],
    },
    cityName: {
      type: String,
    },
    country: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
    arrivalDate: {
      type: String,
      required: [true, 'Arrival date is required'],
    },
    departureDate: {
      type: String,
      required: [true, 'Departure date is required'],
    },
    accommodationName: {
      type: String,
      default: '',
    },
    accommodationCostPerNight: {
      type: Number,
      default: 0,
      min: 0,
    },
    transportCostToStop: {
      type: Number,
      default: 0,
      min: 0,
    },
    transportMode: {
      type: String,
      enum: ['flight', 'train', 'car', 'ferry', 'bus'],
      default: 'flight',
    },
    notes: {
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

const Stop = mongoose.model('Stop', stopSchema);
module.exports = Stop;
