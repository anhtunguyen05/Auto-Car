import express from "express";
const router = express.Router();

import dashboardController from "../controller/dashboard.controller.js";
import carRoutes from "./car.routes.js";
import userRoutes from "./user.routes.js";
import bookingRoutes from "./booking.routes.js";
import userViewRoutes from "./user-view.routes.js";
import ownerRoutes from "./owner.routes.js";
import { requireAdmin, requireAuth, requireCustomer, requireOwner } from "../middleware/auth.middleware.js";

// Redirect root to login if not authenticated
router.get('/', (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login');
  }
  
  // Redirect based on role
  if (req.session.user.role === 'ADMIN') {
    next();
  } else if (req.session.user.role === 'CUSTOMER') {
    res.redirect('/user');
  } else if (req.session.user.role === 'OWNER') {
    res.redirect('/owner');
  }
}, dashboardController.renderDashboard);

// Customer interface routes (require customer authentication)
router.use('/user', requireAuth, requireCustomer, userViewRoutes);

// Owner interface routes (require owner authentication)
router.use('/owner', requireAuth, requireOwner, ownerRoutes);

// Admin routes (require admin authentication)
router.use('/cars', requireAdmin, carRoutes);
router.use('/users', requireAdmin, userRoutes);
router.use('/bookings', requireAdmin, bookingRoutes);

export default router;