const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const userRouter = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const userController = require('../../controllers/userController');
const { cloudinary } = require('../../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const CloudinaryStorages = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'assets/user/profile_picture',
        allowedFormats: ['jpeg', 'jpg', 'png']
    }
})

const storage = multer.diskStorage({
    destination: function (req, file, next) {
        next(null, 'assets/user/profile_picture');
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


userRouter.post('/register', userController.register);
userRouter.get('/:id/transaction/pending', authMiddleware.checkLogin, userController.getUserTransactionPending);
userRouter.get('/:id/transaction/success', authMiddleware.checkLogin, userController.getUserTransactionSuccess);
userRouter.get('/:id/transaction/finish', authMiddleware.checkLogin, userController.getUserTransactionFinished);
userRouter.patch('/:id', authMiddleware.checkLogin, upload.single('profile_picture'), userController.editUser);
userRouter.get('/verify', userController.verification);
userRouter.get('/:id', authMiddleware.checkLogin, userController.getUserDetail);
userRouter.post('/login', userController.login);
userRouter.post('/logout', userController.logout);


module.exports = userRouter;