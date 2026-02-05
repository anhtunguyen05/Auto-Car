import mongoose from "mongoose";
import {BookingStatus ,BookingStatusValues } from "../../enum/booking.enum.js";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    status: {
      type: String,
      enum: BookingStatusValues,
      default: BookingStatus.PENDING,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    rentalDays: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.pre("validate", function () {
  if (this.endDate <= this.startDate) {
    this.invalidate("endDate", "End date must be after start date");
  }
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
