const mongoose = require("mongoose");

const BankAccountDetailsSchema = new mongoose.Schema({
  accountHoldersName: {
    type: String,
    trim: true,
    default: undefined,
  },
  bankName: {
    type: String,
    trim: true,
    default: undefined,
  },
  accountNumber: {
    type: Number,
    trim: true,
    default: undefined,
  },
});

const ServiceSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true,
  },
  serviceAvailable: {
    type: Boolean,
    default: false,
  },
});

const AvailabilitySchema = new mongoose.Schema({
  availabilityName: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
});

const TravelAvailabilitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["local", "national", "international"],
    required: true,
    default: "local",
  },
});

const PreferredScheduleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["weekdays", "weekends", "flexible"],
    required: true,
    default: "weekdays",
  },
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide an Email!"],
    unique: [true, "Email Exist"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    unique: false,
  },
  userName: {
    type: String,
    required: [true, "Please provide a username!"],
    unique: true,
  },
  avatar: { type: String, default: "" },
  hasPosted: { type: Boolean, default: false },
  hasProducts: { type: Boolean, default: false },
  bankAccountDetails: {
    type: BankAccountDetailsSchema,
    default: undefined,
  },
  hiringDetails: {
    email: {
      type: String,
      trim: true,
      default: undefined,
    },
    whatsApp: {
      type: Number,
      trim: true,
      default: undefined,
    },
    location: {
      type: String,
      trim: true,
      default: undefined,
    },
    favoriteCharacters: {
      type: String,
      trim: true,
      default: undefined,
    },
    services: {
      type: [ServiceSchema],
      default: [
        { service: "Costume making", serviceAvailable: false },
        { service: "Makeup and/or prosthetics", serviceAvailable: false },
        { service: "Performance/Acting", serviceAvailable: false },
        { service: "Voice acting", serviceAvailable: false },
        { service: "Photography", serviceAvailable: false },
      ],
    },
    otherServices: {
      type: String,
      trim: true,
      default: undefined,
    },
    availability: {
      type: [AvailabilitySchema],
      default: [
        { availabilityName: "Conventions", isAvailable: false },
        { availabilityName: "Photoshoots", isAvailable: false },
        { availabilityName: "Promotional events", isAvailable: false },
        { availabilityName: "Online appearances/streams", isAvailable: false },
      ],
    },
    otherAvailability: {
      type: String,
      trim: true,
      default: undefined,
    },
    travelAvailability: {
      type: TravelAvailabilitySchema,
    },
    preferredSchedule: {
      type: PreferredScheduleSchema,
    },
  },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;
