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

const UserSchema = new mongoose.Schema(
  {
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
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    avatar: { type: String, default: "" },
    profileDescription: {
      type: String,
      trim: true,
      default: "",
    },
    shopDescription: {
      type: String,
      trim: true,
      default: "",
    },
    bankAccountDetails: {
      type: BankAccountDetailsSchema,
      default: undefined,
    },
    hasHiringDetails: {
      type: Boolean,
      default: false,
    },
    hiringDetails: {
      headline: String,
      subheading: String,
      description: {
        type: String,
        trim: true,
        default: "",
      },
      whatsApp: {
        type: Number,
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
      },
      otherServices: {
        type: String,
        trim: true,
        default: undefined,
      },
      availability: {
        type: [AvailabilitySchema],
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
  },
  { timestamps: true }
);

// Create a virtual field 'productCount'
UserSchema.virtual("productCount", {
  ref: "Product", // Reference to the Product model
  localField: "_id", // User _id field is matched with Product user field
  foreignField: "user", // Field in Product model that refers to User
  count: true, // Only get the number of docs
});

// Ensure virtual fields are serialized
UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;
