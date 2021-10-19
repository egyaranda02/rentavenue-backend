const db = require("../models/index.js");
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { sequelize } = require("../models/index.js");
require("dotenv").config({ path: "./.env" });


module.exports.detailedSearch = async function(req, res){

}

module.exports.getDetailVenue = async function(req, res){
    try{
        const findVenue = await db.Venue.findOne({where: {id: req.params.id},
            include:[
                {
                    model: db.Venue_Photo,
                    attributes: {
                        exclude: ['VenueId','createdAt', 'updatedAt']
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

module.exports.searchVenue = async function(req, res){
    try{
        const findVenue = await db.Venue.findAll({ where: {
            [Op.or]: [
                { name: { [Op.iLike]: `%${req.query.query_string}%` } },
                { city: { [Op.iLike]: `%${req.query.query_string}%` } }
            ],
            is_verified: true
        }})
        return res.status(200).json({
            success:true,
            data: findVenue
        })
    }catch(error){
        return res.status(200).json({
            success:false,
            errors: error.message
        })
    }
}

module.exports.getCity = async function(req, res){
    try{
        const venue = await db.Venue.findAll({ where: {is_verified: true},
            attributes: ['city', 'Venue.city', [sequelize.fn('count', sequelize.col('Venue.id')), 'venueCount']],
            group: ['Venue.city'],
        });
        return res.status(200).json({
            success:true,
            data: venue
        })
    }catch(error){
        console.log(error);
        return res.status(200).json({
            success:false,
            errors: error.message
        })
    }
}

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
        let filename
        let type
        console.log(req.files);
        // Upload KTP
        type = 'ktp'
        filename = req.files['ktp'][0].filename;
        console.log(filename);
        try{
            await db.Document.create({
                VenueId,
                filename,
                type
            })
        }catch(error){
            return res.status(200).json({
                success:false,
                errors: error.message
            })
        }

        // Upload Surat Tanah
        type = 'surat_tanah'
        filename = req.files['surat_tanah'][0].filename;
        try{
            await db.Document.create({
                VenueId,
                filename,
                type
            })
        }catch(error){
            return res.status(200).json({
                success:false,
                errors: error.message
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
                return res.status(200).json({
                    success:false,
                    errors: error.message
                })
            }
        })
        return res.status(200).json({
            success:true,
            message: "Venue created"
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
                errors: error.message
            })
        };
    }
}

module.exports.EditVenue = async function(req,res){
    const{
        name,
        capacity,
        description,
        price
    } = req.body
    try{
        const venue = await db.Venue.findByPk(req.params.id);
        if(!venue){
            if(req.files['venue_photos']){
                req.files['venue_photos'].forEach(async function(file){
                    filename = file.filename;
                    fs.unlinkSync(`./assets/venue/venue_photos/${filename}`)
                })
            }
            return res.status(200).json({
                success:false,
                message: "Venue not found"
            })
        }
        const VenueId = venue.id;
        if(req.files['venue_photos']){
            const PhotoCount = await db.Venue_Photo.findAndCountAll({where: {VenueId: VenueId}})
            let filename
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
                        errors: error.message
                    })
                }
            })
        }
        venue.update({
            name: name,
            capacity: capacity,
            description: description,
            price: price
        });
        return res.status(200).json({
            messages: "Venue updated!",
            data: venue
        })
    }catch(error){
        return res.status(200).json({
            success:false,
            errors: error.message
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
            errors: error.message
        })
    }
}