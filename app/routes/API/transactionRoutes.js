const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const transactionRouter = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const transactionController = require('../../controllers/transactionController');

transactionRouter.post('/', transactionController.createTransaction);
transactionRouter.post('/midtrans/', transactionController.MidtransNotification);


module.exports= transactionRouter;