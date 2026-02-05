import express from "express";
const router = express.Router();

import userViewController from "../controller/user-view.controller.js";

// Home
router.get('/', userViewController.renderHome);

// Browse cars
router.get('/browse-cars', userViewController.renderBrowseCars);

// Book car
router.get('/book-car/:id', userViewController.renderBookCar);
router.post('/book-car/:id', userViewController.handleBookCar);

// My bookings
router.get('/my-bookings', userViewController.renderMyBookings);
router.post('/cancel-booking/:id', userViewController.handleCancelBooking);

export default router;
