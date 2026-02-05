import express from "express";
const router = express.Router();

import userController from "../controller/user.controller.js";

router.get('/', userController.renderUsersList);
router.get('/add', userController.renderUserForm);
router.post('/add', userController.handleUserAdd);
router.get('/edit/:id', userController.renderUserForm);
router.post('/edit/:id', userController.handleUserEdit);

export default router;
