const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const feedbackRouter = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const feedbackController = require('../../controllers/feedbackController');

feedbackRouter.post('/', feedbackController.create);