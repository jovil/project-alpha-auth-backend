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

const ServicesSchema = new mongoose.Schema({
  costumeMaking: {
    type: Boolean,
    default: false,
  },
  makeupAndOrProsthetics: {
    type: Boolean,
    default: false,
  },
  performanceAndOrActing: {
    type: Boolean,
    default: false,
  },
  voiceActing: {
    type: Boolean,
    default: false,
  },
  photography: {
    type: Boolean,
    default: false,
  },
  otherSkills: {
    type: String,
    default: undefined,
  },
});

const AvailabilitySchema = new mongoose.Schema({
  conventions: {
    type: Boolean,
    default: false,
  },
  photoshoots: {
    type: Boolean,
    default: false,
  },
  promotionalEvents: {
    type: Boolean,
    default: false,
  },
  onlineAppearancesAndOrStreams: {
    type: Boolean,
    default: false,
  },
  otherAvailability: {
    type: String,
    default: undefined,
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
      type: ServicesSchema,
      default: undefined,
    },
    availability: {
      type: AvailabilitySchema,
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
