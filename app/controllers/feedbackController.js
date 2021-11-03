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
        if (findTransaction.Checkin_Status.checkout_time == null) {
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