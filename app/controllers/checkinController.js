require("dotenv").config({ path: "./.env" });
const db = require("../models/index.js");
const uuid = require("uuid");
const moment = require('moment');
const { customAlphabet } = require('nanoid');
const { use } = require("../routes/index.js");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports.CheckIn = async function (req, res) {
    const {
        checkin_code
    } = req.body;
    const token = req.cookies.jwt;
    try {
        const decoded = await jwt.verify(token, process.env.SECRET_KEY);
        const checkin_status = await db.Checkin_Status.findOne(
            {
                where: {
                    checkin_code: checkin_code
                }
                , include: [
                    {
                        model: db.Transaction,
                        attributes: {
                            exclude: ['createdAt', 'updatedAt']
                        },
                        include: [
                            {
                                model: db.Venue,
                                attributes: {
                                    exclude: ['createdAt', 'updatedAt']
                                },
                            }
                        ]
                    }
                ]
            }
        )
        if (!checkin_status) {
            return res.status(200).json({
                success: false,
                message: "Invalid Booking Code"
            })
        }
        if (checkin_status.Transaction.Venue.VendorId != decoded.VendorId) {
            return res.status(200).json({
                success: false,
                message: "Error authorization"
            })
        }
        const now = moment();
        if (moment(now).isBefore(checkin_status.Transaction.start_book, 'day') || moment(now).isAfter(checkin_status.Transaction.finish_book, 'day')) {
            return res.status(200).json({
                success: false,
                message: "Please checkIn at the right time"
            })
        }
        const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvxyz', 8);
        const checkout_code = nanoid();
        await checkin_status.update({
            checkin_code: null,
            checkin_time: now,
            checkout_code: checkout_code
        })
        return res.status(200).json({
            success: true,
            message: "Checkin Success"
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

module.exports.Checkout = async function (req, res) {
    const {
        checkout_code
    } = req.body;
    const token = req.cookies.jwt;
    try {
        const decoded = await jwt.verify(token, process.env.SECRET_KEY);
        const now = moment();
        const checkin_status = await db.Checkin_Status.findOne(
            {
                where: {
                    checkout_code: checkout_code
                }
                , include: [
                    {
                        model: db.Transaction,
                        attributes: {
                            exclude: ['createdAt', 'updatedAt']
                        },
                        include: [
                            {
                                model: db.Venue,
                                attributes: {
                                    exclude: ['createdAt', 'updatedAt']
                                },
                            }
                        ]
                    }
                ]
            }
        )
        if (!checkin_status) {
            return res.status(200).json({
                success: false,
                message: "Invalid Booking Code"
            })
        }
        if (checkin_status.Transaction.Venue.VendorId != decoded.VendorId) {
            return res.status(200).json({
                success: false,
                message: "Error authorization"
            })
        }
        if (moment(now).isBefore(checkin_status.Transaction.start_book, 'day') || moment(now).isAfter(checkin_status.Transaction.finish_book, 'day')) {
            return res.status(200).json({
                success: false,
                message: "Please checkOut at the right time"
            })
        }
        const transaction = await db.Transaction.findOne({
            where: { id: checkin_status.TransactionId },
            include: [
                {
                    model: db.Venue,
                    attributes: {
                        include: ['VendorId']
                    }
                }
            ]
        })
        const total_payment = transaction.total_payment;
        const wallet = await db.Wallet.findOne({ where: { VendorId: transaction.Venue.VendorId } });
        await checkin_status.update({
            checkout_code: null,
            checkout_time: now,
        })
        await transaction.update({
            payment_status: 'finished'
        })
        if (!wallet) {
            const newWallet = await db.Wallet.create({
                VendorId: transaction.Venue.VendorId,
                balance: total_payment
            });
            return res.status(200).json({
                success: true,
                message: "Checkout Success"
            })
        }
        const newBalance = wallet.balance + total_payment;
        await wallet.update({
            balance: newBalance
        })
        return res.status(200).json({
            success: true,
            message: "Checkout Success"
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}