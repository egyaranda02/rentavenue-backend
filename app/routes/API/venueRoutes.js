const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const path = require('path');
const vendorRouter = express.Router();
const vendorController = require('../../controllers/venueController');