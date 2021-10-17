const express = require('express');
const apiRouter = express.Router();
const userRoutes = require('./API/userRoutes');
const vendorRoutes = require('./API/vendorRoutes');
const venueRoutes = require('./API/venueRoutes');


apiRouter.use('/user', userRoutes);
apiRouter.use('/vendor', vendorRoutes);
apiRouter.use('/venue', venueRoutes);

module.exports = apiRouter;