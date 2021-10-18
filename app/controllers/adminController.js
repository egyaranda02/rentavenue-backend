require("dotenv").config({ path: "./.env" });
const db = require("../models/index.js");
const uuid = require("uuid");
const fs = require('fs');
const { use } = require("../routes/index.js");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const tokenAge = 60 * 5;

module.exports.login = async function(req, res){
    try{
        const admin = await db.Admin.findOne({where: {email: req.body.email}});
        if(admin){
            const passwordAuth = bcrypt.compareSync(req.body.password, admin.password);
            if(passwordAuth){
                const token = await jwt.sign({AdminId: admin.id}, process.env.SECRET_KEY, {expiresIn: tokenAge});
                res.cookie('jwt', token, {maxAge: 60*5*1000});
                return res.status(201).json({
                    success: true,
                    message: "Login Success",
                    data: {
                        email: admin.email
                    }
                });
            }
            return res.status(200).json({
                success: false,
                message: "Email and password didn't match",
            });
        }
        return res.status(200).json({
            errors: {
                attribute: "Authentication",
                message: "Email is not registered",
            },
        });
    }catch(error){
        return res.status(200).json({
            success: false,
            errors: error.message
        });
    }
}

module.exports.getVenue = async function(req, res){
    try{
        const findVenue = await db.Venue.findAll();
        return res.status(200).json({
            success: true,
            data: findVenue
        })
    }catch(error){
        return res.status(200).json({
            success:false,
            errors: error.message
        })
    }
}

module.exports.getDetailVenue = async function(req, res){
    try{
        const findVenue = await db.Venue.findOne({where: {id: req.params.id},
            include:[
                {
                    model: db.Document,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt']
                    }
                },{
                    model: db.Venue_Photo,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt']
                    }
                }
            ]
        })
        return res.status(200).json({
            success: true,
            data: findVenue
        })
    }catch(error){
        return res.status(200).json({
            success:false,
            errors: error.message
        })
    }
}

module.exports.getUser = async function(req, res){
    try{
        const findUser = await db.User.findAll();
        return res.status(200).json({
            success: true,
            data: findUser
        })
    }catch(error){
        return res.status(200).json({
            success:false,
            errors: error.message
        })
    }
}