const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const adminRouter = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const adminController = require('../../controllers/adminController');

adminRouter.post('/login', adminController.login);
adminRouter.get('/venue', adminController.getVenue);
adminRouter.get('/venue/not_verified', adminController.getVenueNotVerified);
adminRouter.get('/venue/:id', adminController.getDetailVenue);
adminRouter.post('/venue/:id/verification', adminController.venueVerification);
adminRouter.get('/user', adminController.getUser);
adminRouter.post('/logout', adminController.logout);

module.exports = adminRouter;