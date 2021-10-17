require("dotenv").config({ path: "./.env" });
const db = require("../models/index.js");
const uuid = require("uuid");
const fs = require('fs');
const nodemailer = require("nodemailer");
const { use } = require("../routes/index.js");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const smtpTransportModule = require("nodemailer-smtp-transport");

const tokenAge = 60 * 60;

module.exports.getUserDetail = async function(req, res){
    try{
        const user = await db.User.findByPk(req.params.id, {
            attributes:[
                'id',
                'email',
                'firstName',
                'lastName',
                'gender',
                'phone_number',
                'profile_picture'
            ]
        })
        return res.status(200).json({
            data: user,
        });
    }catch(error){
        return res.status(200).json({
            success: false,
            errors: error,
        });
    }
}

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
        const findEmailUser = await db.User.findOne({where: {email: email}});
        const findEmailVendor = await db.Vendor.findOne({where:{email: email}});
        if(findEmailUser || findEmailVendor){
            return res.status(200).json({
                success: false,
                messages: "Email has been used"
            });
        }
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
            const UserId = findActivation.id_user;
            const VendorId = null;
            await db.Wallet.create({
                UserId,
                VendorId
            })
            return res.status(201).json({
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
                return res.status(201).json({
                    success: true,
                    message: "Login Success",
                    data: {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                    }
                });
            }
            return res.status(200).json({
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

module.exports.editUser = async function(req,res){
    const{
        password,
        firstName,
        lastName,
        gender,
        phone_number
    } = req.body;
    const findUser = await db.User.findByPk(req.params.id);
    // Password required
    if (password == null) {
        return res.status(200).json({
            success: false,
            messages: "Please enter the password",
        });
    }
    if (!findUser) {
        return res.status(200).json({
            success: false,
            messages: "User not found!",
        });
    }
    const comparePassword = bcrypt.compareSync(password, findUser.password);
    // If password false
    if (!comparePassword) {
        return res.status(200).json({
            success: false,
            messages: "Wrong Password!",
        });
    }
    // See if user changing profile picture
    let profile_picture;
    if(req.file){
        if(findUser.profile_picture !== 'profile_pict.jpg'){
            fs.unlinkSync(`./assets/user/profile_picture/${findUser.profile_picture}`);
        }
        profile_picture = req.file.filename;
    }
    try{
        findUser.update({
            firstName: firstName,
            lastName: lastName,
            gender: gender,
            phone_number: phone_number,
            profile_picture: profile_picture,
        });
        return res.status(200).json({
            success: true,
            messages: "Profile updated!",
            data: {
                firstName: findUser.firstName,
                lastName: findUser.lastName,
                email: findUser.email
            }
        });
    }catch(error){
        return res.status(200).json({
            success: false,
            errors: error,
        });
    }
}

module.exports.logout = (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(201).json({
        success: true,
        message: "Logout Success",
    });
};