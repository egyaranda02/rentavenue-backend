const express = require('express');
const apiRouter = express.Router();
const userRoutes = require('./API/userRoutes');
const vendorRoutes = require('./API/vendorRoutes');


apiRouter.use('/user', userRoutes);
apiRouter.use('/vendor', vendorRoutes);

module.exports = apiRouter;