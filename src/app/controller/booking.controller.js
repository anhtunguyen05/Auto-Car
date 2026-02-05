import bookingService from "../service/booking.service.js";
import AppError from "../utils/AppError.js";
import { ErrorCodes } from "../utils/errorCodes.js";

class BookingController {
  async getBookings(req, res) {
    try {
      const { userId, carId, startDate, endDate } = req.query;
      const filters = { userId, carId, startDate, endDate };

      const bookings = await bookingService.getAllBookings(filters);
      res.json(bookings);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        res.status(500).json({
          error: {
            message: "Internal Server Error",
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
          },
        });
      }
    }
  }

  async getBookingById(req, res) {
    try {
      const { id } = req.params;
      const booking = await bookingService.getBookingById(id);
      res.json(booking);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        res.status(500).json({
          error: {
            message: "Internal Server Error",
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
          },
        });
      }
    }
  }

  async createBooking(req, res) {
    try {
      const booking = await bookingService.createBooking(req.body);
      res.status(201).json({
        message: "Booking successful",
        booking
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        res.status(500).json({
          error: {
            message: "Internal Server Error",
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
          },
        });
      }
    }
  }

  async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { booking, contract } = await bookingService.updateBookingStatus(id, status);
      res.json({
        message: "Booking status updated",
        booking: booking,
        contract: contract
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        res.status(500).json({
          error: {
            message: "Internal Server Error",
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
          },
        });
      }
    }
  }

  async getUserBookings(req, res) {
    try {
      const { id } = req.params;
      const bookings = await bookingService.getUserBookings(id);
      res.json({
        total: bookings.length,
        bookings
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        res.status(500).json({
          error: {
            message: "Internal Server Error",
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
          },
        });
      }
    }
  }

  async getOwnerBookings(req, res) {
    try {
      const ownerId = req.user._id;
      const bookings = await bookingService.getOwnerBookings(ownerId);
      res.json({
        total: bookings.length,
        bookings
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        res.status(500).json({
          error: {
            message: "Internal Server Error",
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
          },
        });
      }
    }
  }

  async getAdminBookingSummary(req, res) {
    try {
      const summary = await bookingService.getAdminBookingSummary();
      res.json(summary);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            code: error.code,
          },
        });
      } else {
        res.status(500).json({
          error: {
            message: "Internal Server Error",
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
          },
        });
      }
    }
  }

  // View Methods (HTML Render)
  async renderBookingsList(req, res) {
    try {
      console.log('📅 renderBookingsList called');
      const { search, status, page = 1 } = req.query;
      const limit = 10;
      const skip = (page - 1) * limit;

      // Use service to get bookings
      const filters = { status };
      const allBookings = await bookingService.getAllBookings(filters);
      
      // Apply search filter if provided
      let filteredBookings = allBookings;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredBookings = allBookings.filter(booking => 
          booking.userId?.name?.toLowerCase().includes(searchLower) ||
          booking.userId?.email?.toLowerCase().includes(searchLower) ||
          booking.carId?.brand?.toLowerCase().includes(searchLower) ||
          booking.carId?.model?.toLowerCase().includes(searchLower) ||
          booking.carId?.licensePlate?.toLowerCase().includes(searchLower)
        );
      }

      console.log('📅 Total bookings from service:', filteredBookings.length);
      
      // Apply pagination
      const bookings = filteredBookings.slice(skip, skip + limit);
      const totalBookings = filteredBookings.length;
      const totalPages = Math.ceil(totalBookings / limit);

      console.log('📅 Bookings for this page:', bookings.length);
      console.log('📅 First booking:', bookings[0]);

      const pagination = totalPages > 1 ? {
        page: parseInt(page),
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        prevPage: parseInt(page) - 1,
        nextPage: parseInt(page) + 1,
        pages: Array.from({ length: totalPages }, (_, i) => ({
          number: i + 1,
          active: i + 1 === parseInt(page)
        }))
      } : null;

      res.render('bookings/list', {
        title: 'Booking Management',
        isBookings: true,
        bookings,
        search,
        status,
        pagination
      });
    } catch (error) {
      console.error('Bookings list error:', error);
      res.status(500).render('error', { 
        title: 'Error',
        error: 'Failed to load bookings: ' + error.message
      });
    }
  }

  async renderBookingForm(req, res) {
    try {
      // Get all cars and users for the form
      const Car = (await import('../model/Car.js')).default;
      const User = (await import('../model/User.js')).default;

      const cars = await Car.find({ status: 'AVAILABLE' }).lean();
      const customers = await User.find().select('name email').lean();

      res.render('bookings/form', {
        title: 'Add New Booking',
        isBookings: true,
        cars,
        customers
      });
    } catch (error) {
      console.error('Booking form error:', error);
      res.status(500).render('error', {
        title: 'Error',
        error: 'Failed to load booking form: ' + error.message
      });
    }
  }

  async handleBookingAdd(req, res) {
    try {
      console.log('📝 Booking form data:', req.body);
      
      // Prepare booking data with all fields from form
      const bookingData = {
        userId: req.body.customerId,
        carId: req.body.carId,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        totalPrice: parseFloat(req.body.totalPrice),
        paymentMethod: req.body.paymentMethod,
        paymentStatus: req.body.paymentStatus,
        deposit: parseFloat(req.body.deposit) || 0,
        notes: req.body.notes || ''
      };

      console.log('📝 Processed booking data:', bookingData);

      // Use booking service to create booking with validation
      const booking = await bookingService.createBooking(bookingData);
      
      console.log('✅ Booking created successfully:', booking._id);

      res.redirect('/bookings?success=' + encodeURIComponent('Booking created successfully'));
    } catch (error) {
      console.error('❌ Booking add error:', error);
      res.redirect('/bookings/add?error=' + encodeURIComponent(error.message));
    }
  }

  async renderBookingDetail(req, res) {
    try {
      const { id } = req.params;
      const booking = await bookingService.getBookingById(id);
      
      res.render('bookings/detail', {
        title: 'Booking Details',
        isBookings: true,
        booking
      });
    } catch (error) {
      console.error('Booking detail error:', error);
      res.status(500).render('error', {
        title: 'Error',
        error: 'Failed to load booking details: ' + error.message
      });
    }
  }

  async handleBookingConfirm(req, res) {
    try {
      const { id } = req.params;
      console.log('✅ Confirming booking:', id);
      
      await bookingService.updateBookingStatus(id, 'CONFIRMED');
      
      res.redirect('/bookings?success=' + encodeURIComponent('Booking confirmed successfully'));
    } catch (error) {
      console.error('❌ Booking confirm error:', error);
      res.redirect('/bookings?error=' + encodeURIComponent(error.message));
    }
  }

  async handleBookingComplete(req, res) {
    try {
      const { id } = req.params;
      console.log('✅ Completing booking:', id);
      
      await bookingService.updateBookingStatus(id, 'COMPLETED');
      
      res.redirect('/bookings?success=' + encodeURIComponent('Booking completed successfully'));
    } catch (error) {
      console.error('❌ Booking complete error:', error);
      res.redirect('/bookings?error=' + encodeURIComponent(error.message));
    }
  }

  async handleBookingCancel(req, res) {
    try {
      const { id } = req.params;
      console.log('❌ Cancelling booking:', id);
      
      await bookingService.updateBookingStatus(id, 'CANCELLED');
      
      res.redirect('/bookings?success=' + encodeURIComponent('Booking cancelled successfully'));
    } catch (error) {
      console.error('❌ Booking cancel error:', error);
      res.redirect('/bookings?error=' + encodeURIComponent(error.message));
    }
  }

}

export default new BookingController();
