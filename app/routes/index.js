const express = require('express');
const apiRouter = express.Router();
const userRoutes = require('./API/userRoutes');
const vendorRoutes = require('./API/vendorRoutes');
const venueRoutes = require('./API/venueRoutes');
const adminRoutes = require('./API/adminRoutes');


apiRouter.use('/user', userRoutes);
apiRouter.use('/vendor', vendorRoutes);
apiRouter.use('/venue', venueRoutes);
apiRouter.use('/admin', adminRoutes);

module.exports = apiRouter;