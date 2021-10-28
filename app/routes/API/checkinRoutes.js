const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const checkinRouter = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const checkinController = require('../../controllers/checkinController');


checkinRouter.get('/', authMiddleware.checkLogin, authMiddleware.checkVendor);
checkinRouter.post('/in', authMiddleware.checkLogin, authMiddleware.checkVendor, checkinController.CheckIn);
checkinRouter.post('/out', authMiddleware.checkLogin, authMiddleware.checkVendor, checkinController.Checkout);

module.exports = checkinRouter;