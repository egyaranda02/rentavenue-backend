const express = require('express')
const cookieParser = require("cookie-parser");
const cors = require("cors");
const moment = require('moment');
const path = require('path');
const db = require("./models/index.js");
const { Op } = require("sequelize");
const cron = require('node-cron');
const app = express()

const apiRoutes = require("./routes/index");

const transactionExpiration = cron.schedule('* * * * *', async () => {
    console.log('Checking Transactions Expiration');
    const transactions = await db.Transaction.findAll({
        where: {
            payment_status: 'pending',
            expiredAt: {
                [Op.lte]: moment()
            }
        }
    })
    transactions.forEach(async function (transaction) {
        await transaction.update({
            payment_status: "expired",
            token: null,
            expiredAt: null
        })
    })
});

const autoCheckout = cron.schedule('* * * * *', async () => {
    console.log('Auto Checkout');
    const checkin_status = await db.Checkin_Status.findAll({
        where: {
            checkout_time: null
        },
        attributes: ['id', 'TransactionId', 'checkout_time'],
        include: [
            {
                model: db.Transaction,
                attributes: ['total_payment', 'payment_status', 'finish_book'],
                where: {
                    payment_status: "settlement",
                    finish_book: {
                        [Op.lt]: moment()
                    }
                },
                include: [
                    {
                        model: db.Venue,
                        attributes: ['VendorId']
                    }
                ]
            }
        ]
    })
    checkin_status.forEach(async function (checkin) {
        const now = moment();
        if (moment(now).isAfter(checkin.Transaction.finish_book, 'day')) {
            const total_payment = checkin.Transaction.total_payment;
            const wallet = await db.Wallet.findOne({ where: { VendorId: checkin.Transaction.Venue.VendorId } });
            await checkin.update({
                checkin_code: null,
                checkout_code: null,
                checkout_time: now
            })
            await db.Transaction.update(
                { payment_status: 'finished' },
                { where: { id: checkin.TransactionId } }
            )
            if (!wallet) {
                await db.Wallet.create({
                    VendorId: checkin.Transaction.Venue.VendorId,
                    balance: total_payment
                })
            } else if (wallet) {
                const newBalance = wallet.balance + total_payment;
                await wallet.update({
                    balance: newBalance
                })
            }
        }
    })
});


const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/assets/user/profile_picture', express.static(path.join(__dirname, '/assets/user/profile_picture')));
app.use('/assets/vendor/profile_picture', express.static(path.join(__dirname, '/assets/vendor/profile_picture')));
app.use('/assets/venue/documents', express.static(path.join(__dirname, '/assets/venue/documents')));
app.use('/assets/venue/venue_photos', express.static(path.join(__dirname, '/assets/venue/venue_photos')));

app.use(cookieParser());
app.get('/', (req, res) => res.send('Hello World!'))
app.use("/api", apiRoutes);
transactionExpiration.start();
autoCheckout.start();
app.listen(process.env.PORT || 5000, () => console.log(`This App is Running on port ` + port))