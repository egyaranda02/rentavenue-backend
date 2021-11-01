const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const vendorRouter = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const vendorController = require('../../controllers/vendorController');

const storage = multer.diskStorage({
    destination: function (req, file, next) {
        next(null, 'assets/vendor/profile_picture');
    },
    filename: function (req, file, next) {
        next(null, uuid.v4() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, next) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        next(null, true);
    } else {
        next(new Error('Please only upload jpeg, jpg, and png'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

vendorRouter.post('/register', vendorController.register);
vendorRouter.get('/:id/venue/verified', authMiddleware.checkLogin, authMiddleware.checkVendor, vendorController.getVenueVerified)
vendorRouter.get('/:id/venue/notverified', authMiddleware.checkLogin, authMiddleware.checkVendor, vendorController.getVenueNotVerified)
vendorRouter.get('/:id/transaction/pending', authMiddleware.checkLogin, authMiddleware.checkVendor, vendorController.getVendorTransactionPending)
vendorRouter.get('/:id/transaction/success', authMiddleware.checkLogin, authMiddleware.checkVendor, vendorController.getVendorTransactionSuccess)
vendorRouter.patch('/:id', authMiddleware.checkLogin, upload.single('profile_picture'), vendorController.editVendor);
vendorRouter.get('/verify', vendorController.verification);
vendorRouter.get('/:id', vendorController.getVendorDetails);
vendorRouter.post('/login', vendorController.login);
vendorRouter.post('/logout', vendorController.logout);

module.exports = vendorRouter;