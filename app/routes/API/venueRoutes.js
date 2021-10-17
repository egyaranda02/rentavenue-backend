const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const venueRouter = express.Router();
const venueController = require('../../controllers/venueController');

const storage = multer.diskStorage({
    destination: function(req, file, next){
        if(file.fieldname === 'documents'){
            next(null, 'assets/venue/documents');
        }else{
            next(null, 'assets/venue/venue_photos');
        }
    },
    filename: function(req, file, next){
        next(null, uuid.v4() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, next)=>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
        next(null, true);
    }else{
        next(new Error('Please only upload jpeg, jpg, and png'), false);
    }
};

const upload = multer({ 
    storage : storage,
    fileFilter: fileFilter
});

venueRouter.post('/', upload.fields([{name:'venue_photos', maxCount: 5}, {name:'documents', maxCount: 5}]), venueController.Create);
venueRouter.patch('/:id', upload.fields([{name:'venue_photos', maxCount: 5}, {name:'documents', maxCount: 5}]), venueController.EditVenue);
venueRouter.delete('/:id', venueController.deleteVenue);


module.exports = venueRouter;