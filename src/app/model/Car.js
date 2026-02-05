import mongoose from "mongoose";
import { CarStatusValues } from "../../enum/car.enum.js";

const carSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: CarStatusValues,
      default: "AVAILABLE",
    },
    approved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.model("Car", carSchema);

export default Car;
