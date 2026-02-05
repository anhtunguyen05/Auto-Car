import Booking from "../model/Booking.js";
import Car from "../model/Car.js";
import User from "../model/User.js";
import Contract from "../model/Contract.js";
import { CarStatus } from "../../enum/car.enum.js";
import { BookingStatus } from "../../enum/booking.enum.js";
import AppError from "../utils/AppError.js";
import { ErrorCodes } from "../utils/errorCodes.js";

class BookingService {
  async getAllBookings(filters = {}) {
    try {
      const query = {};

      if (filters.userId) {
        query.userId = filters.userId;
      }

      if (filters.carId) {
        query.carId = filters.carId;
      }

      if (filters.status) {
        query.status = filters.status.toUpperCase();
      }

      if (filters.startDate) {
        query.startDate = { $gte: new Date(filters.startDate) };
      }

      if (filters.endDate) {
        query.endDate = { $lte: new Date(filters.endDate) };
      }

      const bookings = await Booking.find(query)
        .populate("userId", "name email phone")
        .populate("carId", "brand model licensePlate pricePerDay")
        .sort({ createdAt: -1 })
        .lean();

      return bookings;
    } catch (error) {
      throw error;
    }
  }

  async getBookingById(bookingId) {
    try {
      const booking = await Booking.findById(bookingId)
        .populate({
          path: "userId",
          select: "name email phone role"
        })
        .populate({
          path: "carId",
          select: "brand model licensePlate pricePerDay status approved",
          populate: {
            path: "ownerId",
            select: "name email phone"
          }
        });

      if (!booking) {
        throw new AppError("Booking not found", ErrorCodes.BOOKING_NOT_FOUND, 404);
      }

      return booking;
    } catch (error) {
      throw error;
    }
  }

  async createBooking(bookingData) {
    try {
      const { userId, carId, startDate, endDate } = bookingData;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError("User not found", ErrorCodes.USER_NOT_FOUND, 404);
      }

      const car = await Car.findById(carId);
      if (!car) {
        throw new AppError("Car not found", ErrorCodes.CAR_NOT_FOUND, 404);
      }

      if (car.status !== CarStatus.AVAILABLE) {
        throw new AppError("Car is not available", ErrorCodes.CAR_NOT_AVAILABLE, 400);
      }

      const hasConflict = await this.checkBookingConflict(
        carId,
        startDate,
        endDate
      );

      if (hasConflict) {
        throw new AppError("Booking time overlaps", ErrorCodes.BOOKING_CONFLICT, 400);
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const rentalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const totalCost = rentalDays * car.pricePerDay;

      const booking = new Booking({
        userId,
        carId,
        startDate,
        endDate,
        status: BookingStatus.PENDING,
        totalCost,
        rentalDays,
      });

      await booking.save();

      car.status = CarStatus.RENTED;
      await car.save();

      return await booking.populate([
        { path: "userId", select: "name email phone" },
        { path: "carId", select: "brand model licensePlate pricePerDay" },
      ]);
    } catch (error) {
      throw error;
    }
  }

  async updateBookingStatus(bookingId, status) {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        throw new AppError("Booking not found", ErrorCodes.BOOKING_NOT_FOUND, 404);
      }

      booking.status = status;
      let contract = null;

      if (status === BookingStatus.CONFIRMED) {
        contract = new Contract({
          bookingId: booking._id,
          userId: booking.userId,
          carId: booking.carId,
          contractDate: new Date(),
          totalCost: booking.totalCost,
        });
        await contract.save();
      }

      // When booking is completed or cancelled, make car available again
      if (status === BookingStatus.COMPLETED || status === BookingStatus.CANCELLED) {
        const car = await Car.findById(booking.carId);
        if (car) {
          car.status = CarStatus.AVAILABLE;
          await car.save();
          console.log(`🚗 Car ${car._id} is now AVAILABLE (booking ${status})`);
        }
      }

      await booking.save();
      return { booking, contract };
    } catch (error) {
      throw error;
    }
  }


  async checkBookingConflict(carId, startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const conflictingBooking = await Booking.findOne({
        carId,
        $or: [
          {
            startDate: { $lt: end },
            endDate: { $gt: start },
          },
        ],
      });

      return !!conflictingBooking;
    } catch (error) {
      throw error;
    }
  }

  async getUserBookings(userId) {
    try {
      const bookings = await Booking.find({ userId })
        .populate({
          path: "carId",
          select: "brand model licensePlate pricePerDay status",
          populate: {
            path: "ownerId",
            select: "name phone"
          }
        })
        .sort({ createdAt: -1 });

      return bookings;
    } catch (error) {
      throw error;
    }
  }

  async getOwnerBookings(ownerId) {
    try {
      // Find all cars owned by this owner
      const ownerCars = await Car.find({ ownerId }).select("_id");
      const carIds = ownerCars.map(car => car._id);

      // Find all bookings for these cars
      const bookings = await Booking.find({ carId: { $in: carIds } })
        .populate({
          path: "userId",
          select: "name email phone"
        })
        .populate({
          path: "carId",
          select: "brand model licensePlate pricePerDay status"
        })
        .sort({ createdAt: -1 });

      return bookings;
    } catch (error) {
      throw error;
    }
  }

  async getAdminBookingSummary() {
    try {
      // Total bookings count
      const totalBookings = await Booking.countDocuments();

      // Bookings by status
      const bookingsByStatus = await Booking.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalRevenue: { $sum: "$totalCost" }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Total revenue
      const totalRevenue = await Booking.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$totalCost" }
          }
        }
      ]);

      // Recent bookings
      const recentBookings = await Booking.find()
        .populate("userId", "name email")
        .populate("carId", "brand model licensePlate")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      return {
        totalBookings,
        bookingsByStatus: bookingsByStatus.map(item => ({
          status: item._id,
          count: item.count,
          totalRevenue: item.totalRevenue
        })),
        totalRevenue: totalRevenue[0]?.total || 0,
        recentBookings
      };
    } catch (error) {
      throw error;
    }
  }

}

export default new BookingService();