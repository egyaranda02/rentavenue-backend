const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const transactionRouter = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const transactionController = require('../../controllers/transactionController');
const feedbackController = require('../../controllers/feedbackController');


transactionRouter.post('/', authMiddleware.checkUser, transactionController.createTransaction);
transactionRouter.post('/midtrans/notification', transactionController.MidtransNotification);
transactionRouter.post('/:id/feedback/', authMiddleware.checkUser, feedbackController.create);
module.exports = transactionRouter;