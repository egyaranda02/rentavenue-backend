const express = require('express');
const apiRouter = express.Router();
const userRoutes = require('./API/userRoutes');
const vendorRoutes = require('./API/vendorRoutes');
const venueRoutes = require('./API/venueRoutes');
const adminRoutes = require('./API/adminRoutes');
const transactionRoutes = require('./API/transactionRoutes');


apiRouter.use('/user', userRoutes);
apiRouter.use('/vendor', vendorRoutes);
apiRouter.use('/venue', venueRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/transaction', transactionRoutes);

module.exports = apiRouter;