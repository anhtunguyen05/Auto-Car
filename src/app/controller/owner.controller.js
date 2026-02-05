import Booking from "../model/Booking.js";
import Car from "../model/Car.js";
import carService from "../service/car.service.js";
import AppError from "../utils/AppError.js";
import { ErrorCodes } from "../utils/errorCodes.js";

const ownerController = {
  // Render owner home page
  renderHome: async (req, res, next) => {
    try {
      res.render("owner/home", {
        title: "Owner Dashboard",
        layout: "owner",
        isHome: true,
      });
    } catch (error) {
      next(error);
    }
  },

  // Render my cars list
  renderMyCars: async (req, res, next) => {
    try {
      const ownerId = req.session.user._id;
      const cars = await Car.find({ ownerId }).populate("ownerId");

      res.render("user/my-cars", {
        title: "My Cars",
        layout: "owner",
        isMyCars: true,
        cars,
      });
    } catch (error) {
      next(error);
    }
  },

  // Render add car form
  renderAddCar: async (req, res, next) => {
    try {
      res.render("user/add-car", {
        title: "Add Car",
        layout: "owner",
        isAddCar: true,
      });
    } catch (error) {
      next(error);
    }
  },

  // Handle add car
  handleAddCar: async (req, res, next) => {
    try {
      const { brand, model, licensePlate, pricePerDay } = req.body;
      const ownerId = req.session.user._id;

      await carService.createCar({
        brand,
        model,
        licensePlate,
        pricePerDay: parseFloat(pricePerDay),
        ownerId,
        approved: true, // Auto-approve for owners
      });

      res.redirect("/owner/my-cars?success=" + encodeURIComponent("Car added successfully!"));
    } catch (error) {
      if (error instanceof AppError) {
        res.render("user/add-car", {
          title: "Add Car",
          layout: "owner",
          isAddCar: true,
          error: error.message,
        });
      } else {
        next(error);
      }
    }
  },

  // Render edit car form
  renderEditCar: async (req, res, next) => {
    try {
      const carId = req.params.id;
      const ownerId = req.session.user._id;
      
      const car = await carService.getCarById(carId);
      
      // Check if the owner is the one editing
      if (car.ownerId.toString() !== ownerId.toString()) {
        throw new AppError("You can only edit your own cars", ErrorCodes.FORBIDDEN, 403);
      }

      res.render("owner/edit-car", {
        title: "Edit Car",
        layout: "owner",
        car,
      });
    } catch (error) {
      next(error);
    }
  },

  // Handle edit car
  handleEditCar: async (req, res, next) => {
    try {
      const carId = req.params.id;
      const ownerId = req.session.user._id;
      const { brand, model, licensePlate, pricePerDay } = req.body;

      const car = await carService.getCarById(carId);
      
      // Check if the owner is the one editing
      if (car.ownerId.toString() !== ownerId.toString()) {
        throw new AppError("You can only edit your own cars", ErrorCodes.FORBIDDEN, 403);
      }

      await carService.updateCar(carId, {
        brand,
        model,
        licensePlate,
        pricePerDay: parseFloat(pricePerDay),
      });

      res.redirect("/owner/my-cars?success=" + encodeURIComponent("Car updated successfully!"));
    } catch (error) {
      if (error instanceof AppError) {
        const car = await carService.getCarById(req.params.id);
        res.render("owner/edit-car", {
          title: "Edit Car",
          layout: "owner",
          car,
          error: error.message,
        });
      } else {
        next(error);
      }
    }
  },

  // Handle delete car
  handleDeleteCar: async (req, res, next) => {
    try {
      const carId = req.params.id;
      const ownerId = req.session.user._id;

      const car = await carService.getCarById(carId);
      
      // Check if the owner is the one deleting
      if (car.ownerId.toString() !== ownerId.toString()) {
        throw new AppError("You can only delete your own cars", ErrorCodes.FORBIDDEN, 403);
      }

      await carService.deleteCar(carId);

      res.redirect("/owner/my-cars?success=" + encodeURIComponent("Car deleted successfully!"));
    } catch (error) {
      next(error);
    }
  },

  // Render bookings for owner's cars
  renderBookings: async (req, res, next) => {
    try {
      const ownerId = req.session.user._id;
      
      // Find all cars owned by this owner
      const cars = await Car.find({ ownerId });
      const carIds = cars.map(car => car._id);
      
      // Find all bookings for these cars
      const bookings = await Booking.find({ carId: { $in: carIds } })
        .populate("carId")
        .populate("userId")
        .sort({ createdAt: -1 });

      res.render("owner/bookings", {
        title: "Bookings",
        layout: "owner",
        isBookings: true,
        bookings,
      });
    } catch (error) {
      next(error);
    }
  },

  // Render booking detail
  renderBookingDetail: async (req, res, next) => {
    try {
      const bookingId = req.params.id;
      const ownerId = req.session.user._id;
      
      const booking = await Booking.findById(bookingId)
        .populate("carId")
        .populate("userId");

      if (!booking) {
        throw new AppError("Booking not found", ErrorCodes.BOOKING_NOT_FOUND, 404);
      }

      // Check if the booking is for a car owned by this owner
      if (booking.carId.ownerId.toString() !== ownerId.toString()) {
        throw new AppError("You can only view bookings for your own cars", ErrorCodes.FORBIDDEN, 403);
      }

      res.render("owner/booking-detail", {
        title: "Booking Detail",
        layout: "owner",
        booking,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default ownerController;
