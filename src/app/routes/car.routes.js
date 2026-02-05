import express from "express";
const router = express.Router();

import carController from "../controller/car.controller.js";

router.get('/', carController.renderCarsList);
router.get('/add', carController.renderCarForm);
router.post('/add', carController.handleCarAdd);
router.get('/edit/:id', carController.renderCarForm);
router.post('/edit/:id', carController.handleCarEdit);
router.get('/:id', carController.renderCarDetails);

export default router;
