const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const venueRouter = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const venueController = require('../../controllers/venueController');
const feedbackController = require('../../controllers/feedbackController');
const { cloudinary } = require('../../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const CloudinaryStorages = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: (req, file) => {
            let subFolder = ''
            if (file.fieldname === 'venue_photos') {
                subFolder = 'assets/venue/venue_photos'
            } else {
                subFolder = 'assets/venue/documents'
            }
            return subFolder
        },
        allowedFormats: ['jpeg', 'jpg', 'png']
    }
})

const storage = multer.diskStorage({
    destination: function (req, file, next) {
        if (file.fieldname === 'venue_photos') {
            next(null, 'assets/venue/venue_photos');
        } else {
            next(null, 'assets/venue/documents');
        }
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
    storage: CloudinaryStorages,
    fileFilter: fileFilter
});

venueRouter.get('/', venueController.getAll);
venueRouter.get('/price/desc', venueController.getAllPriceDesc);
venueRouter.get('/price/asc', venueController.getAllPriceAsc);
venueRouter.get('/city', venueController.getCity);
venueRouter.get('/city/:city', venueController.getVenueByCity);
venueRouter.get('/search', venueController.searchVenue);
venueRouter.post('/', authMiddleware.checkLogin, authMiddleware.checkVendor, upload.fields([{ name: 'venue_photos', maxCount: 5 }, { name: 'ktp', maxCount: 1 }, { name: 'surat_tanah', maxCount: 1 }]), venueController.Create);
venueRouter.patch('/:id', authMiddleware.checkLogin, authMiddleware.checkVendor, upload.fields([{ name: 'venue_photos', maxCount: 5 }]), venueController.EditVenue);
venueRouter.get('/:id/date', venueController.getVenueDate);
venueRouter.get('/:id/feedback', feedbackController.getFeedbackVenue);
venueRouter.get('/:id', venueController.getDetailVenue);
venueRouter.delete('/photo/:photoId', authMiddleware.checkLogin, authMiddleware.checkVendor, venueController.deleteVenuePhotos)
venueRouter.delete('/:id', authMiddleware.checkLogin, authMiddleware.checkVendor, venueController.deleteVenue);

module.exports = venueRouter;