import dotenv from "dotenv";
dotenv.config();

import { connect } from "./src/config/db.config.js";
import carService from "./src/app/service/car.service.js";

console.log("Testing car service...");

connect().then(() => {
  console.log("✅ Connected to MongoDB");
  
  return carService.getAllCars({});
}).then(cars => {
  console.log("✅ Found", cars.length, "cars");
  if (cars.length > 0) {
    console.log("First car:", JSON.stringify(cars[0], null, 2));
  }
  process.exit(0);
}).catch(error => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
