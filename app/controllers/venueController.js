const db = require("../models/index.js");
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
require("dotenv").config({ path: "./.env" });

module.exports.Create = async function(req, res){
    const{
        name,
        capacity,
        description,
        price,
        city,
        address,
        longitude,
        latitude
    } = req.body
    try{
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const VendorId = decoded.VendorId;
        if(VendorId == null){
            return res.status(201).json({
                succes: false,
                message: "You are not a vendor"
            });
        }
        const venue = await db.Venue.create({
            VendorId,
            name,
            capacity,
            description,
            price,
            city,
            address,
            longitude,
            latitude
        });
        const VenueId = venue.id;
        req.files['venue_photos'].forEach(async function(file){
            filename = file.filename;
            try{
                await db.Venue_Photo.create({
                    VenueId,
                    filename
                })
            }catch(error){
                return res.status(200).json({
                    success:false,
                    errors: error
                })
            }
        })
        return res.status(200).json({
            message: "ok"
        });
    }catch(error){
        if(error.name === "SequelizeValidationError"){
            return res.status(200).json({
                success:false,
                errors: error.errors.map((e)=>{
                    return{
                        attribute: e.path,
                        message: e.message
                    };
                })
            })
        }else{
            console.log(error);
            return res.status(200).json({
                success:false,
                errors: error
            })
        };
    }
}

module.exports.EditVenue = async function(req,res){
    const{
        name,
        capacity,
        description,
        price,
        city,
        address,
        longitude,
        latitude
    } = req.body
    try{
        const venue = await db.Venue.findByPk(req.params.id);
        if(req.files['venue_photos']){
            const VenueId = venue.id;
            const PhotoCount = await db.Venue_Photo.findAndCountAll({where: {VenueId: VenueId}})
            if(PhotoCount.count > 5){
                return res.status(200).json({
                    success:false,
                    message: "Max photo reached (5)"
                })
            }
            req.files['venue_photos'].forEach(async function(file){
                filename = file.filename;
                try{
                    await db.Venue_Photo.create({
                        VenueId,
                        filename
                    })
                }catch(error){
                    console.log(error)
                    return res.status(200).json({
                        success:false,
                        errors: error
                    })
                }
            })
        }
        venue.update({
            name: name,
            capacity: capacity,
            description: description,
            price: price,
            city: city,
            address: address,
            longitude: longitude,
            latitude: latitude
        });
        return res.status(200).json({
            messages: "Venue updated!",
            data: venue
        })
    }catch(error){
        return res.status(200).json({
            success:false,
            errors: error
        })
    }
}

module.exports.deleteVenue = async function(req, res){
    const {id} = req.params
    try{
        await db.Venue.destroy({where: {id: id}})
        return res.status(200).json({
            success: true,
            messages: "Delete success!"
        })
    }catch(error){
        console.log(error);
        return res.status(200).json({
            success:false,
            errors: error
        })
    }
}