require('dotenv').config({path: '../.env'});
const db = require('../models/index.js');
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");

const checkLogin = (req, res, next) =>{
    const token = req.cookies.jwt;
    if(!token){
        return res.status(401).json({
            success: false,
            message: "You aren't logged in"
        })
    }
    next();
}

const checkAdmin = (req, res, next)=>{
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if(!decoded.AdminId){
        return res.status(401).json({
            success: false,
            message: "You are not an Admin"
        })
    }
    next();
}

module.exports = {checkLogin, checkAdmin}