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
const port = 5000

const transactionExpiration = cron.schedule('* * * * *', async () => {
    console.log('Checking Transactions Expiration');
    const transactions = await db.Transaction.findAll({
        where: {
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
        include: [
            {
                model: db.Transaction,
                attribute: {
                    exclude: ['createdAt', 'updatedAt']
                },
                where: {
                    payment_status: "settlement",
                    finish_book: {
                        [Op.lt]: moment()
                    }
                }
            }
        ]
    })
    checkin_status.forEach(async function (checkin) {
        const now = moment();
        if (moment(now).isAfter(checkin.Transaction.finish_book, 'day')) {
            await checkin.update({
                checkin_code: null,
                checkout_code: null,
                checkout_time: now
            })
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
app.listen(port, () => console.log(`This App is Running on port ` + port))