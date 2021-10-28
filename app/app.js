const express = require('express')
const cookieParser = require("cookie-parser");
const cors = require("cors");
const moment = require('moment');
const db = require("./models/index.js");
const { Op } = require("sequelize");
const cron = require('node-cron');
const app = express()

const apiRoutes = require("./routes/index");
const port = 5000

const task = cron.schedule('* * * * *', async () => {
    console.log('Checking Transactions Expiration');
    const transactions = await db.Transaction.findAll({
        where: {
            expiredAt: {
                [Op.lte]: moment()
            }
        }
    })
    transactions.forEach(async function(transaction){
        await transaction.update({
            payment_status: "expired",
            token: null,
            expiredAt: null
        })
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



app.use(cookieParser());
app.get('/', (req, res) => res.send('Hello World!'))
app.use("/api", apiRoutes);
task.start();
app.listen(port, () => console.log(`This App is Running on port ` + port))