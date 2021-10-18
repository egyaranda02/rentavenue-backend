const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const userRouter = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const userController = require('../../controllers/userController');

const storage = multer.diskStorage({
    destination: function(req, file, next){
        next(null, 'assets/user/profile_picture');
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
    storage: storage,
    fileFilter: fileFilter
});


userRouter.post('/register', userController.register);
userRouter.patch('/:id', authMiddleware.checkLogin, upload.single('profile_picture'), userController.editUser);
userRouter.get('/verify', userController.verification);
userRouter.get('/:id', authMiddleware.checkLogin, userController.getUserDetail);
userRouter.post('/login', userController.login);
userRouter.post('/logout', userController.logout);


module.exports = userRouter;