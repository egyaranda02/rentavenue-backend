const express = require('express')
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express()

const apiRoutes = require("./routes/index");
const port = 5000

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => res.send('Hello World!'))
app.use("/api", apiRoutes);
app.listen(port, () => console.log(`This App is Running on port ` + port))