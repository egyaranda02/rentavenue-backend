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

module.exports.getVendorDetails = async function(req, res){
    try{
        const vendor = await db.Vendor.findByPk(req.params.id, {
            attributes:[
                'id',
                'email',
                'vendor_name',
                'address',
                'description',
                'phone_number',
                'profile_picture'
            ]
        })
        return res.status(200).json({
            data: vendor,
        });
    }catch(error){
        return res.status(200).json({
            success: false,
            errors: error,
        });
    }
}


module.exports.register = async function(req,res){
    const{
        email,
        password,
        vendor_name,
        address,
        phone_number,
        description
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
        const vendor = await db.Vendor.create({
            email,
            password,
            vendor_name,
            address,
            phone_number,
            description
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
        const link = "http://" + host + "/api/vendor/verify?token=" + token;
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
            id_vendor: vendor.id,
            token: token,
        });
        return res.status(201).json({
            messages: "Register Success!",
            data: vendor
        });
    }catch(error){
        console.log(error);
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
            const vendor = await db.Vendor.findByPk(findActivation.id_vendor);
            await vendor.update({is_verified: true});
            await db.Activation.destroy({where: {id: findActivation.id}});
            const VendorId = findActivation.id_vendor;
            const UserId = null;
            await db.Wallet.create({
                VendorId,
                UserId
            })
            return res.status(201).json({
                success: true,
                messages: "Email verification success",
            });
        }
        return res.status(200).json({
            success: false,
            errors: "Token not found",
        });
    }catch(error){
        return res.status(200).json({
            success: false,
            errors: error,
        });
    }
}

module.exports.login = async function(req, res){
    try{
        const vendor = await db.Vendor.findOne({where: {email: req.body.email}});
        if(vendor){
            if(vendor.is_verified == false){
                return res.status(200).json({
                    errors: {
                        attribute: "Authentication",
                        message: "Please activate your email first",
                    },
                });
            }
            const passwordAuth = bcrypt.compareSync(req.body.password, vendor.password);
            if(passwordAuth){
                const token = await jwt.sign({VendorId: vendor.id}, process.env.SECRET_KEY, {expiresIn: tokenAge});
                res.cookie("jwt", token, { maxAge: 60*60*1000 });
                return res.status(201).json({
                    success: true,
                    message: "Login Success",
                    data: {
                        vendor_name: vendor.vendor_name,
                        email: vendor.email
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

module.exports.editVendor = async function(req, res){
    const{
        password,
        vendor_name,
        address,
        phone_number,
        description
    } = req.body;
    const findVendor = await db.Vendor.findByPk(req.params.id);
    // Require password for edit profile
    if (password == null) {
        return res.status(200).json({
            success: false,
            messages: "Please enter the password",
        });
    }
    if (!findVendor) {
        return res.status(200).json({
            success: false,
            messages: "Vendor not found!",
        });
    }
    // compare password
    const comparePassword = bcrypt.compareSync(password, findVendor.password);
    if(!comparePassword){
        return res.status(200).json({
            success: false,
            messages: "Wrong Password!",
        });
    }
    // See if user changing profile picture
    let profile_picture;
    if(req.file){
        if(findVendor.profile_picture != 'profile_pict.jpg'){
            fs.unlinkSync(`./assets/vendor/profile_picture/${findVendor.profile_picture}`);
        }
        profile_picture = req.file.filename;
    }
    try{
        findVendor.update({
            vendor_name: vendor_name,
            address: address,
            phone_number: phone_number,
            description: description,
            profile_picture: profile_picture
        });
        return res.status(200).json({
            success: true,
            messages: "Profile updated!",
            data: {
                vendor_name: findVendor.vendor_name,
                email: findVendor.email
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