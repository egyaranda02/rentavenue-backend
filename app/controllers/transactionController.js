const db = require("../models/index.js");
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');
const { sequelize } = require("../models/index.js");
require("dotenv").config({ path: "./.env" });
const midtransClient = require('midtrans-client');

module.exports.createTransaction = async function(req, res){
    const{
        VenueId,
        start_book,
        finish_book,
    } = req.body
    const now = moment();
    if(moment(start_book).isBefore(now)){
        return res.status(400).json({
            success: false,
            message: "Can't book days in the past"
        });
    }
    if(moment(finish_book).isBefore(start_book)){
        return res.status(400).json({
            success: false,
            message: "Error input book time"
        });
    }
    
    let snap = new midtransClient.Snap({
        // Set to true if you want Production Environment (accept real transaction).
        isProduction : false,
        serverKey : process.env.MIDTRANS_SERVER_KEY
    });

    try{
        const date1 = new Date(start_book);
        const date2 = new Date(finish_book);
        const diffTime = Math.abs(date2 - date1);
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        diffDays += 1;
        const token = req.cookies.jwt;
        const decoded = await jwt.verify(token, process.env.SECRET_KEY);
        const UserId = decoded.UserId;
        const user = await db.User.findByPk(UserId);
        const venue = await db.Venue.findByPk(VenueId);
        // Check book on venue
        const venueBook = await db.Transaction.findOne({
            where: {
                VenueId: VenueId,
                [Op.or]: [
                        {[Op.and] : {
                            start_book: {
                                [Op.lte]: start_book
                            },
                            finish_book:{
                                [Op.gte]: finish_book
                            }
                        }},
                        {start_book: {
                            [Op.between]:[
                                start_book,
                                finish_book
                            ]
                        }},
                        {finish_book: {
                            [Op.between]:[
                                start_book,
                                finish_book
                            ]
                        }}
                ]
            }
        })
        console.log(venueBook);
        if(venueBook){
            return res.status(200).json({
                success: false,
                message: "Date is taken"
            });
        }
        const total_payment = venue.price * diffDays;

        const transaction = await db.Transaction.create({
            UserId,
            VenueId,
            start_book,
            finish_book,
            total_payment
        })

        let midtransParam = {
            "transaction_details": {
                "order_id": transaction.id,
                "gross_amount": total_payment
            },"item_details": [
                {
                    "id": venue.id,
                    "price": venue.price,
                    "quantity": diffDays,
                    "name": venue.name
                }
            ],
            "customer_details": {
                "first_name": user.firstName,
                "last_name": user.lastName,
                "email": user.email,
                "phone": user.phone_number
            }
        }
        await snap.createTransaction(midtransParam)
        .then((trade)=>{
            // transaction token
            let transactionToken = trade.token;
            transaction.update({
                token: transactionToken
            })
            console.log('transactionToken:',transactionToken);

            let transactionRedirectUrl = trade.redirect_url;
            console.log('transactionRedirectUrl:',transactionRedirectUrl);
            return res.status(200).json({
                data: transaction,
                redirect_url: transactionRedirectUrl
            })
        })
    }catch(error){
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

}

module.exports.MidtransNotification = async function(req,res){
    let apiClient = new midtransClient.Snap({
        isProduction : false,
        serverKey : process.env.MIDTRANS_SERVER_KEY,
        clientKey : process.env.MIDTRANS_CLIENT_KEY
    });

    apiClient.transaction.notification(req)
    .then((statusResponse)=>{
        let orderId = statusResponse.order_id;
        let transactionStatus = statusResponse.transaction_status;
        let fraudStatus = statusResponse.fraud_status;

        const transaction = db.Transaction.findByPk(orderId);

        console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

        // Sample transactionStatus handling logic
        if (transactionStatus == 'capture'){
            transaction.update({
                payment_status: "capture"
            })
            return res.status(200).json({
                success: true,
                message: "Payment received"
            })
        } else if (transactionStatus == 'settlement'){
            transaction.update({
                payment_status: "settlement"
            })
            return res.status(200).json({
                success: true,
                message: "Payment received"
            })
        } else if (transactionStatus == 'cancel' ||
            transactionStatus == 'deny' ||
            transactionStatus == 'expire'){
                transaction.update({
                    payment_status: "Failed"
                })
                return res.status(200).json({
                    success: true,
                    message: "Transaction Failed"
                })
        } else if (transactionStatus == 'pending'){
            transaction.update({
                payment_status: "pending"
            })
            return res.status(200).json({
                success: true,
                message: "Payment pending"
            })
        }
    });
}
