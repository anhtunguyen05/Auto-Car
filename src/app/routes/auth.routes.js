import express from "express";
const router = express.Router();

import authController from "../controller/auth.controller.js";

// View routes
router.get('/login', authController.renderLogin);
router.get('/register', authController.renderRegister);
router.post('/login', authController.handleLogin);
router.post('/register', authController.handleRegister);
router.get('/logout', authController.logout);

// API routes (JSON)
router.post('/api/register', authController.register);
router.post('/api/login', authController.login);

export default router;
