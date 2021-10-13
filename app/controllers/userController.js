require("dotenv").config({ path: "./.env" });
const db = require("../models/index.js");
const uuid = require("uuid");
const nodemailer = require("nodemailer");
const { use } = require("../routes/index.js");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const smtpTransportModule = require("nodemailer-smtp-transport");

const tokenAge = 60 * 60;
module.exports.register = async function(req, res){
    const{
        email,
        password,
        firstName,
        lastName,
        gender,
        phone_number
    } = req.body;
    try{
        const user = await db.User.create({
            email,
            password,
            firstName,
            lastName,
            gender,
            phone_number
        });
        const smtpTransport = nodemailer.createTransport(
            smtpTransportModule({
                service: "gmail",
                auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
                },
            })
        );
        const token = uuid.v4();
        const host = req.get("host");
        const link = "http://" + host + "/api/user/verify?token=" + token;
        mailOptions = {
            to: email,
            subject: "Please confirm your Email account",
            html:
            "Hello,<br> Please Click on the link to verify your email.<br><a href=" +
            link +
            ">Click here to verify</a>",
        };
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                return res.status(200).json("error");
            } else {
                console.log("Message sent");
            }
        });
        await db.Activation.create({
            id_user: user.id,
            token: token,
        });
        res.status(201).json({
            messages: "Register Success!",
            data: user
        });
    }catch(error){
        return res.status(200).json({
            success:false,
            errors: error
        })
    }
}

module.exports.verification = async function(req, res){
    const token = req.query.token;
    try{
        const findActivation = await db.Activation.findOne({where: {token: token}});
        if(findActivation){
            const user = await db.User.findByPk(findActivation.id_user);
            await user.update({is_verified: true});
            await db.Activation.destroy({where: {id: findActivation.id}});
            res.status(201).json({
                success: true,
                messages: "Email verification success",
            });
        }else{
            return res.status(200).json({
                success: false,
                errors: "Token not found",
            });
        }
    }catch(error){
        return res.status(200).json({
            success: false,
            errors: error,
        });
    }
};

module.exports.login = async function(req, res){
    try{
        const user = await db.User.findOne({ where: {email: req.body.email} });
        if(user){
            if(user.is_verified == false){
                return res.status(200).json({
                    errors: {
                        attribute: "Authentication",
                        message: "Please activate your email first",
                    },
                });
            }
            const passwordAuth = bcrypt.compareSync(req.body.password, user.password);
            if(passwordAuth){
                const token = await jwt.sign({UserId: user.id}, process.env.SECRET_KEY, {expiresIn: tokenAge});
                res.cookie("jwt", token, { maxAge: 60*60*1000 });
                res.status(201).json({
                    success: true,
                    message: "Login Success",
                    data: {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                    }
                });
            }
            res.status(200).json({
                success: false,
                message: "Email and password didn't match",
            });
        }
        res.status(200).json({
            errors: {
                attribute: "Authentication",
                message: "Email is not registered",
            },
        });
    }catch(error){
        return res.status(200).json({
            success: false,
            errors: error,
        });
    }
}