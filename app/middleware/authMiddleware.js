require('dotenv').config({ path: '../.env' });
const db = require('../models/index.js');
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");

const checkLogin = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "You aren't logged in"
        })
    }
    next();
}

const checkAdmin = (req, res, next) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded.AdminId) {
        return res.status(401).json({
            success: false,
            message: "You are not an Admin"
        })
    }
    const admin = db.Admin.findByPk(decoded.AdminId);
    if (!admin) {
        return res.status(401).json({
            success: false,
            message: "You are not an Admin"
        })
    }
    next();
}

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded.UserId) {
        return res.status(401).json({
            success: false,
            message: "You are not a User"
        })
    }
    next();
}

const checkVendor = (req, res, next) => {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded.VendorId) {
        return res.status(401).json({
            success: false,
            message: "You are not a Vendor"
        })
    }
    next();
}

module.exports = { checkLogin, checkAdmin, checkUser, checkVendor }