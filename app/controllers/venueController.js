const db = require("../models/index.js");
const { Op, Transaction } = require("sequelize");
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');
const { sequelize } = require("../models/index.js");
require("dotenv").config({ path: "./.env" });


module.exports.getAll = async function (req, res) {
    try {
        const findVenue = await db.Venue.findAll({
            where: { is_verified: true }
        });
        return res.status(200).json({
            success: true,
            data: findVenue
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.getAllPriceDesc = async function (req, res) {
    try {
        const findVenue = await db.Venue.findAll({
            where: { is_verified: true },
            order: [
                ['price', 'DESC'],
            ]
        })
        return res.status(200).json({
            success: true,
            data: findVenue
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.getAllPriceAsc = async function (req, res) {
    try {
        const findVenue = await db.Venue.findAll({
            where: { is_verified: true },
            order: [
                ['price', 'ASC'],
            ]
        })
        return res.status(200).json({
            success: true,
            data: findVenue
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.getDetailVenue = async function (req, res) {
    try {
        const findVenue = await db.Venue.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: db.Venue_Photo,
                    attributes: {
                        exclude: ['VenueId', 'createdAt', 'updatedAt']
                    }
                }
            ]
        })
        if (!findVenue) {
            return res.status(404).json({
                success: false,
                message: "Venue not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: findVenue
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.searchVenue = async function (req, res) {
    try {
        const findVenue = await db.Venue.findAll({
            where: {
                [Op.and]: [
                    { capacity: { [Op.gte]: req.query.capacity } },
                    { city: { [Op.iLike]: `%${req.query.city}%` } },
                ],
                is_verified: true
            },
            include: {
                model: db.Transaction,
                attributes: [
                    'start_book', 'finish_book'
                ]
            }
        })
        function filterDate(array) {
            for (let i = 0; i < array.length; i++) {
                console.log("Function")
                array[i].Transactions.map(transaction => {
                    console.log(transaction.start_book);
                    if (moment(req.query.start_book).isBetween(transaction.start_book, transaction.finish_book) ||
                        moment(req.query.start_book).isSame(transaction.start_book) ||
                        moment(req.query.start_book).isSame(transaction.finish_book) ||
                        moment(req.query.finish_book).isSame(transaction.start_book) ||
                        moment(req.query.finish_book).isSame(transaction.finish_book) ||
                        moment(req.query.finish_book).isBetween(transaction.start_book, transaction.finish_book) ||
                        (moment(req.query.start_book).isSameOrBefore(transaction.start_book) && moment(req.query.finish_book).isSameOrAfter(transaction.finish_book))) {
                        array.splice(i, 1);
                        console.log("Object deleted")
                    }
                })
            }

        }
        filterDate(findVenue);
        return res.status(200).json({
            success: true,
            data: findVenue
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.getCity = async function (req, res) {
    try {
        const venue = await db.Venue.findAll({
            where: { is_verified: true },
            attributes: ['city', 'Venue.city', [sequelize.fn('count', sequelize.col('Venue.id')), 'venueCount']],
            group: ['Venue.city'],
        });
        return res.status(200).json({
            success: true,
            data: venue
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.getVenueByCity = async function (req, res) {
    try {
        const venue = await db.Venue.findAll({
            where: { city: req.params.city },
        });
        return res.status(200).json({
            success: true,
            data: venue
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.Create = async function (req, res) {
    const {
        name,
        capacity,
        description,
        price,
        city,
        address,
        longitude,
        latitude
    } = req.body
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const VendorId = decoded.VendorId;
        if (VendorId == null) {
            return res.status(200).json({
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

        // Upload KTP
        try {
            type = 'ktp'
            filename = req.files['ktp'][0].filename;
            await db.Document.create({
                VenueId,
                filename,
                type
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }

        // Upload Surat Tanah
        try {
            type = 'surat_tanah'
            filename = req.files['surat_tanah'][0].filename;
            await db.Document.create({
                VenueId,
                filename,
                type
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }

        req.files['venue_photos'].forEach(async function (file) {
            filename = file.filename;
            try {
                await db.Venue_Photo.create({
                    VenueId,
                    filename
                })
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                })
            }
        })
        return res.status(201).json({
            success: true,
            data: venue
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.EditVenue = async function (req, res) {
    const {
        name,
        capacity,
        description,
        price
    } = req.body
    try {
        const venue = await db.Venue.findByPk(req.params.id);
        if (!venue) {
            if (req.files['venue_photos']) {
                req.files['venue_photos'].forEach(async function (file) {
                    filename = file.filename;
                    fs.unlinkSync(`./assets/venue/venue_photos/${filename}`)
                })
            }
            return res.status(404).json({
                success: false,
                message: "Venue not found"
            })
        }
        const VenueId = venue.id;
        if (req.files['venue_photos']) {
            const PhotoCount = await db.Venue_Photo.findAndCountAll({ where: { VenueId: VenueId } })
            let filename
            if (PhotoCount.count > 5) {
                return res.status(400).json({
                    success: false,
                    message: "Max photo reached (5)"
                })
            }
            req.files['venue_photos'].forEach(async function (file) {
                filename = file.filename;
                try {
                    await db.Venue_Photo.create({
                        VenueId,
                        filename
                    })
                } catch (error) {
                    console.log(error)
                    return res.status(400).json({
                        success: false,
                        message: error.message
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
            message: "Venue updated!",
            data: venue
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.deleteVenue = async function (req, res) {
    const { id } = req.params
    try {
        await db.Venue.destroy({ where: { id: id } })
        return res.status(200).json({
            success: true,
            message: "Delete success!"
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}