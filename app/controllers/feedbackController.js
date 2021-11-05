const db = require("../models/index.js");
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');
const { sequelize } = require("../models/index.js");
require("dotenv").config({ path: "./.env" });

module.exports.create = async function (req, res) {
    const {
        feedback_content,
        rating
    } = req.body
    try {
        const checkUnique = await db.Feedback.findOne({
            where: {
                TransactionId: req.params.id
            }
        });
        if (checkUnique) {
            return res.status(200).json({
                success: false,
                message: "You already post a feedback once"
            })
        }
        if (!rating) {
            return res.status(200).json({
                success: false,
                message: "Rating can't be empty"
            })
        }
        if (!feedback_content) {
            return res.status(200).json({
                success: false,
                message: "Feedback content can't be empty"
            })
        }
        const token = req.cookies.jwt;
        const decoded = await jwt.verify(token, process.env.SECRET_KEY);
        const findTransaction = await db.Transaction.findOne({
            where: {
                id: req.params.id
            },
            include: [
                {
                    model: db.Checkin_Status,
                    attributes: {
                        exclude: ['TransactionId', 'createdAt', 'updatedAt']
                    }
                }
            ]
        })
        if (!findTransaction) {
            return res.status(200).json({
                success: false,
                message: "Transaction not found"
            })
        }
        if (!findTransaction.Checkin_Status) {
            return res.status(200).json({
                success: false,
                message: "Transaction not completed"
            })
        }
        if (findTransaction.UserId != decoded.UserId) {
            return res.status(200).json({
                success: false,
                message: "You are not authorized"
            })
        }
        if (findTransaction.payment_status != 'finished') {
            return res.status(200).json({
                success: false,
                message: "Please checkout before writing feedback"
            })
        }
        const TransactionId = req.params.id
        const feedback = await db.Feedback.create({
            TransactionId,
            feedback_content,
            rating
        })
        return res.status(200).json({
            success: true,
            data: feedback
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.getFeedbackVenue = async function (req, res) {
    try {
        const findFeedback = await db.Feedback.findAll({
            attributes: {
                exclude: ['updatedAt']
            },
            include: [
                {
                    model: db.Transaction,
                    where: {
                        VenueId: req.params.id
                    },
                    attributes: ['VenueId'],
                    include: [
                        {
                            model: db.User,
                            attributes: ['firstName', 'lastName', 'profile_picture']
                        }
                    ]
                }
            ]
        })
        let avgRating = 0
        findFeedback.forEach(async function (feedback) {
            avgRating += feedback.rating
        })
        avgRating /= findFeedback.length;
        return res.status(200).json({
            success: true,
            data: {
                averageRating: avgRating,
                findFeedback
            }
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}