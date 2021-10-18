const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const adminRouter = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const adminController = require('../../controllers/adminController');

adminRouter.post('/login', adminController.login);
adminRouter.get('/venue', adminController.getVenue);
adminRouter.get('/venue/:id', adminController.getDetailVenue);
adminRouter.get('/user', adminController.getUser);

module.exports = adminRouter;