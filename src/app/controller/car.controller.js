import carService from "../service/car.service.js";
import AppError from "../utils/AppError.js";
import { ErrorCodes } from "../utils/errorCodes.js";

class CarController {
  // API Methods (JSON Response)
  async getCars(req, res) {
    try {
      const { status, minPrice, maxPrice, name } = req.query;
      const filters = { status, minPrice, maxPrice, name };

      const cars = await carService.getAllCars(filters);
      res.json(cars);
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

  async getCarById(req, res) {
    try {
      const car = await carService.getCarById(req.params.id);
      res.json(car);
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

  async renderCarsList(req, res) {
    try {
      console.log('🚗 renderCarsList called');
      const { search, status, page = 1 } = req.query;
      const limit = 10;
      const skip = (page - 1) * limit;

      const filters = { name: search, status };
      const allCars = await carService.getAllCars(filters);
      
      console.log('🚗 Total cars from service:', allCars.length);
      
      const cars = allCars.slice(skip, skip + limit);
      const totalCars = allCars.length;
      const totalPages = Math.ceil(totalCars / limit);

      console.log('🚗 Cars for this page:', cars.length);
      console.log('🚗 First car:', cars[0]);

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

      res.render('cars/list', {
        title: 'Car Management',
        isCars: true,
        cars,
        search,
        status,
        pagination
      });
    } catch (error) {
      console.error('Cars list error:', error);
      res.status(500).render('error', { 
        title: 'Error',
        error: 'Failed to load cars: ' + error.message
      });
    }
  }

  async renderCarForm(req, res) {
    try {
      const carId = req.params.id;
      let car = null;

      if (carId) {
        car = await carService.getCarById(carId);
      }

      res.render('cars/form', {
        title: carId ? 'Edit Car' : 'Add New Car',
        isCars: true,
        car
      });
    } catch (error) {
      console.error('Car form error:', error);
      res.status(500).render('error', {
        title: 'Error',
        error: 'Failed to load car form: ' + error.message
      });
    }
  }

  async renderCarDetails(req, res) {
    try {
      const car = await carService.getCarById(req.params.id);
      
      // Get bookings for this car
      const Booking = (await import('../model/Booking.js')).default;
      const bookings = await Booking.find({ carId: req.params.id })
        .populate('userId', 'name email')
        .sort({ startDate: -1 })
        .limit(10)
        .lean();

      res.render('cars/detail', {
        title: 'Car Details',
        isCars: true,
        car,
        bookings
      });
    } catch (error) {
      console.error('Car details error:', error);
      res.status(500).render('error', {
        title: 'Error',
        error: 'Failed to load car details: ' + error.message
      });
    }
  }

  async handleCarAdd(req, res) {
    try {
      const Car = (await import('../model/Car.js')).default;
      const User = (await import('../model/User.js')).default;
      
      // Get first user as owner if not specified
      let ownerId = req.body.ownerId;
      if (!ownerId) {
        const firstUser = await User.findOne();
        ownerId = firstUser ? firstUser._id : null;
      }

      const carData = {
        ownerId,
        brand: req.body.brand,
        model: req.body.model,
        licensePlate: req.body.licensePlate,
        pricePerDay: req.body.pricePerDay,
        status: req.body.status || 'AVAILABLE'
      };
      
      const car = new Car(carData);
      await car.save();

      res.redirect('/cars?success=Car added successfully');
    } catch (error) {
      console.error('Car add error:', error);
      res.redirect('/cars/add?error=' + encodeURIComponent(error.message));
    }
  }

  async handleCarEdit(req, res) {
    try {
      const Car = (await import('../model/Car.js')).default;
      
      const carData = {
        brand: req.body.brand,
        model: req.body.model,
        licensePlate: req.body.licensePlate,
        pricePerDay: req.body.pricePerDay,
        status: req.body.status
      };
      
      await Car.findByIdAndUpdate(req.params.id, carData);
      res.redirect('/cars?success=Car updated successfully');
    } catch (error) {
      console.error('Car edit error:', error);
      res.redirect(`/cars/edit/${req.params.id}?error=` + encodeURIComponent(error.message));
    }
  }
}

export default new CarController();