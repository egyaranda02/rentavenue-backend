require('dotenv').config({path: '../.env'});
const db = require('../models/index.js');
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");

const checkLogin = (req, res, next) =>{
    const token = req.cookies.jwt;
    if(!token){
        return res.status(200).json({
            success: false,
            message: "You aren't logged in"
        })
    }
    next();
}

module.exports = {checkLogin}