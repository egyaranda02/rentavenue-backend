const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const userRouter = express.Router();
const userController = require('../../controllers/userController');

userRouter.post('/register', userController.register);
userRouter.get('/verify', userController.verification);

module.exports = userRouter;