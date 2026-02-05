import Car from "../model/Car.js";
import { CarStatus } from "../../enum/car.enum.js";
import AppError from "../utils/AppError.js";
import { ErrorCodes } from "../utils/errorCodes.js";

class CarService {
  async getAllCars(filters = {}) {
    try {
      const query = {};

      if (filters.status) {
        const statusUpper = filters.status.toUpperCase();
        if (Object.values(CarStatus).includes(statusUpper)) {
          query.status = statusUpper;
        }
      }

      if (filters.minPrice || filters.maxPrice) {
        query.pricePerDay = {};
        if (filters.minPrice) {
          query.pricePerDay.$gte = parseFloat(filters.minPrice);
        }
        if (filters.maxPrice) {
          query.pricePerDay.$lte = parseFloat(filters.maxPrice);
        }
      }

      if (filters.name) {
        query.$or = [
          { brand: { $regex: filters.name, $options: "i" } },
          { model: { $regex: filters.name, $options: "i" } },
        ];
      }

      const cars = await Car.find(query).lean();
      return cars;
    } catch (error) {
      throw error;
    }
  }

  async getCarById(carId) {
    try {
      const car = await Car.findById(carId).populate('ownerId', 'name email phone').lean();
      
      if (!car) {
        throw new AppError("Car not found", ErrorCodes.CAR_NOT_FOUND, 404);
      }
      
      return car;
    } catch (error) {
      throw error;
    }
  }

  async createCar(carData) {
    try {
      const { licensePlate } = carData;
      
      // Check if license plate already exists
      const existingCar = await Car.findOne({ licensePlate: licensePlate.toUpperCase() });
      if (existingCar) {
        throw new AppError("License plate already exists", ErrorCodes.DUPLICATE_LICENSE_PLATE, 400);
      }

      const car = new Car(carData);
      await car.save();
      
      return car;
    } catch (error) {
      throw error;
    }
  }

  async updateCar(carId, carData) {
    try {
      const car = await Car.findById(carId);
      
      if (!car) {
        throw new AppError("Car not found", ErrorCodes.CAR_NOT_FOUND, 404);
      }

      // If license plate is being updated, check for duplicates
      if (carData.licensePlate && carData.licensePlate !== car.licensePlate) {
        const existingCar = await Car.findOne({ 
          licensePlate: carData.licensePlate.toUpperCase(),
          _id: { $ne: carId }
        });
        
        if (existingCar) {
          throw new AppError("License plate already exists", ErrorCodes.DUPLICATE_LICENSE_PLATE, 400);
        }
      }

      Object.assign(car, carData);
      await car.save();
      
      return car;
    } catch (error) {
      throw error;
    }
  }

  async deleteCar(carId) {
    try {
      const car = await Car.findById(carId);
      
      if (!car) {
        throw new AppError("Car not found", ErrorCodes.CAR_NOT_FOUND, 404);
      }

      await Car.findByIdAndDelete(carId);
      
      return { message: "Car deleted successfully" };
    } catch (error) {
      throw error;
    }
  }
}

export default new CarService();