const express = require('express');
const apiRouter = express.Router();
const userRoutes = require('./API/userRoutes');


apiRouter.use('/user', userRoutes);

module.exports = apiRouter;