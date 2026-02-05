import express from "express";
const router = express.Router();

import ownerController from "../controller/owner.controller.js";

// Home
router.get('/', ownerController.renderHome);

// My cars
router.get('/my-cars', ownerController.renderMyCars);
router.get('/add-car', ownerController.renderAddCar);
router.post('/add-car', ownerController.handleAddCar);
router.get('/edit-car/:id', ownerController.renderEditCar);
router.post('/edit-car/:id', ownerController.handleEditCar);
router.post('/delete-car/:id', ownerController.handleDeleteCar);

// Bookings for my cars
router.get('/bookings', ownerController.renderBookings);
router.get('/bookings/:id', ownerController.renderBookingDetail);

export default router;
