import express from "express";
const router = express.Router();

import User from "../model/User.js";
import Car from "../model/Car.js";
import Booking from "../model/Booking.js";
import bookingService from "../service/booking.service.js";
import carService from "../service/car.service.js";
import { CarStatus } from "../../enum/car.enum.js";

class UserViewController {
  // Home page
  async renderHome(req, res) {
    try {
      res.render('user/home', {
        layout: 'user',
        title: 'Home',
        isHome: true
      });
    } catch (error) {
      console.error('User home error:', error);
      res.status(500).render('error', {
        title: 'Error',
        error: 'Failed to load home page: ' + error.message
      });
    }
  }

  // Browse available cars
  async renderBrowseCars(req, res) {
    try {
      const { search, sort } = req.query;
      
      let query = { status: CarStatus.AVAILABLE, approved: true };
      
      if (search) {
        query.$or = [
          { brand: new RegExp(search, 'i') },
          { model: new RegExp(search, 'i') },
          { type: new RegExp(search, 'i') }
        ];
      }

      let sortOption = { createdAt: -1 };
      if (sort === 'price-asc') sortOption = { pricePerDay: 1 };
      else if (sort === 'price-desc') sortOption = { pricePerDay: -1 };
      else if (sort === 'year-desc') sortOption = { year: -1 };

      const cars = await Car.find(query).sort(sortOption).lean();

      res.render('user/browse-cars', {
        layout: 'user',
        title: 'Browse Cars',
        isBrowseCars: true,
        cars,
        search,
        sort
      });
    } catch (error) {
      console.error('Browse cars error:', error);
      res.status(500).render('error', {
        layout: 'user',
        title: 'Error',
        error: 'Failed to load cars: ' + error.message
      });
    }
  }

  // Book a car form
  async renderBookCar(req, res) {
    try {
      const { id } = req.params;
      const car = await Car.findById(id).lean();

      if (!car) {
        return res.redirect('/user/browse-cars?error=' + encodeURIComponent('Car not found'));
      }

      if (car.status !== CarStatus.AVAILABLE) {
        return res.redirect('/user/browse-cars?error=' + encodeURIComponent('Car is not available'));
      }

      res.render('user/book-car', {
        layout: 'user',
        title: 'Book Car',
        isBrowseCars: true,
        car
      });
    } catch (error) {
      console.error('Book car error:', error);
      res.redirect('/user/browse-cars?error=' + encodeURIComponent(error.message));
    }
  }

  // Handle book car submission
  async handleBookCar(req, res) {
    try {
      const { id } = req.params;
      
      // Get logged in user from session
      const customerId = req.session.user._id;

      const bookingData = {
        userId: customerId,
        carId: id,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        totalPrice: parseFloat(req.body.totalPrice),
        paymentMethod: req.body.paymentMethod,
        paymentStatus: req.body.paymentStatus,
        deposit: parseFloat(req.body.deposit) || 0,
        notes: req.body.notes || ''
      };

      await bookingService.createBooking(bookingData);
      
      res.redirect('/user/my-bookings?success=' + encodeURIComponent('Booking created successfully!'));
    } catch (error) {
      console.error('Handle book car error:', error);
      res.redirect('/user/book-car/' + req.params.id + '?error=' + encodeURIComponent(error.message));
    }
  }

  // My bookings
  async renderMyBookings(req, res) {
    try {
      // Get bookings for logged in user
      const userId = req.session.user._id;
      
      const bookings = await Booking.find({ userId })
        .populate('carId', 'brand model licensePlate')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .lean();

      res.render('user/my-bookings', {
        layout: 'user',
        title: 'My Bookings',
        isMyBookings: true,
        bookings
      });
    } catch (error) {
      console.error('My bookings error:', error);
      res.status(500).render('error', {
        layout: 'user',
        title: 'Error',
        error: 'Failed to load bookings: ' + error.message
      });
    }
  }

  // Add car form
  async renderAddCar(req, res) {
    try {
      res.render('user/add-car', {
        layout: 'user',
        title: 'List Your Car',
        isMyCars: true
      });
    } catch (error) {
      console.error('Add car form error:', error);
      res.status(500).render('error', {
        layout: 'user',
        title: 'Error',
        error: 'Failed to load form: ' + error.message
      });
    }
  }

  // Handle add car submission
  async handleAddCar(req, res) {
    try {
      // Get logged in user as owner
      const ownerId = req.session.user._id;

      const carData = {
        ...req.body,
        ownerId,
        status: CarStatus.AVAILABLE,
        approved: true // Auto approve - no need admin approval
      };

      await carService.createCar(carData);
      
      res.redirect('/user/my-cars?success=' + encodeURIComponent('Car listed successfully!'));
    } catch (error) {
      console.error('Handle add car error:', error);
      res.redirect('/user/add-car?error=' + encodeURIComponent(error.message));
    }
  }

  // My cars
  async renderMyCars(req, res) {
    try {
      // Get cars owned by logged in user
      const ownerId = req.session.user._id;
      
      const cars = await Car.find({ ownerId }).sort({ createdAt: -1 }).lean();

      res.render('user/my-cars', {
        layout: 'user',
        title: 'My Cars',
        isMyCars: true,
        cars
      });
    } catch (error) {
      console.error('My cars error:', error);
      res.status(500).render('error', {
        layout: 'user',
        title: 'Error',
        error: 'Failed to load cars: ' + error.message
      });
    }
  }

  // Cancel booking
  async handleCancelBooking(req, res) {
    try {
      const { id } = req.params;
      await bookingService.updateBookingStatus(id, 'CANCELLED');
      
      res.redirect('/user/my-bookings?success=' + encodeURIComponent('Booking cancelled successfully'));
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.redirect('/user/my-bookings?error=' + encodeURIComponent(error.message));
    }
  }
}

export default new UserViewController();
