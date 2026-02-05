import express from "express";
const router = express.Router();

import bookingController from "../controller/booking.controller.js";

// Bookings View Routes
router.get('/', bookingController.renderBookingsList);
router.get('/add', bookingController.renderBookingForm);
router.post('/add', bookingController.handleBookingAdd);
router.get('/:id', bookingController.renderBookingDetail);

// Booking Status Update Routes
router.post('/:id/confirm', bookingController.handleBookingConfirm);
router.post('/:id/complete', bookingController.handleBookingComplete);
router.post('/:id/cancel', bookingController.handleBookingCancel);

export default router;
