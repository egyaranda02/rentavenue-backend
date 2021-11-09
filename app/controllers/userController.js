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
const { cloudinary } = require("../config/cloudinary.js");

const tokenAge = 60 * 60;

module.exports.getUserDetail = async function (req, res) {
    try {
        const user = await db.User.findByPk(req.params.id, {
            attributes: [
                'id',
                'email',
                'firstName',
                'lastName',
                'gender',
                'phone_number',
                'profile_picture',
                'url'
            ]
        })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

module.exports.register = async function (req, res) {
    const {
        email,
        password,
        confirm_password,
        firstName,
        lastName,
        gender,
        phone_number
    } = req.body;
    try {
        if (password !== confirm_password) {
            return res.status(200).json({
                success: false,
                message: "Password and confirm password is not the same"
            });
        }
        const findEmailUser = await db.User.findOne({ where: { email: email } });
        const findEmailVendor = await db.Vendor.findOne({ where: { email: email } });
        if (findEmailUser || findEmailVendor) {
            return res.status(200).json({
                success: false,
                message: "Email has been used"
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
                return res.status(200).json({
                    success: false,
                    message: "Failed to send email"
                });
            } else {
                console.log("Message sent");
            }
        });
        await db.Activation.create({
            id_user: user.id,
            token: token,
        });
        res.status(201).json({
            message: "Register Success!",
            data: user
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

module.exports.verification = async function (req, res) {
    const token = req.query.token;
    try {
        const findActivation = await db.Activation.findOne({ where: { token: token } });
        if (findActivation) {
            const user = await db.User.findByPk(findActivation.id_user);
            await user.update({ is_verified: true });
            await db.Activation.destroy({ where: { id: findActivation.id } });
            const UserId = findActivation.id_user;
            const VendorId = null;
            await db.Wallet.create({
                UserId,
                VendorId
            })
            return res.status(200).json({
                success: true,
                message: "Email verification success",
            });
        } else {
            return res.status(200).json({
                success: false,
                message: "Token not found",
            });
        }
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports.login = async function (req, res) {
    try {
        const user = await db.User.findOne({ where: { email: req.body.email } });
        if (user) {
            if (user.is_verified == false) {
                return res.status(200).json({
                    succes: false,
                    message: "Please verify you email first"
                });
            }
            const passwordAuth = bcrypt.compareSync(req.body.password, user.password);
            if (passwordAuth) {
                const token = await jwt.sign({ UserId: user.id }, process.env.SECRET_KEY, { expiresIn: tokenAge });
                res.cookie("jwt", token, { maxAge: 60 * 60 * 1000, httpOnly: true, secure: false });
                return res.status(201).json({
                    success: true,
                    message: "Login Success",
                    data: {
                        UserId: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        token: token
                    }
                });
            }
            return res.status(200).json({
                success: false,
                message: "Email and password didn't match",
            });
        }
        return res.status(404).json({
            success: false,
            message: "Email is not registered",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

module.exports.editUser = async function (req, res) {
    const {
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
            message: "Please enter the password",
        });
    }
    if (!findUser) {
        return res.status(404).json({
            success: false,
            message: "User not found!",
        });
    }
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (decoded.UserId != req.params.id) {
        return res.status(401).json({
            success: false,
            message: "You don't have authorization"
        })
    }
    const comparePassword = bcrypt.compareSync(password, findUser.password);
    // If password false
    if (!comparePassword) {
        return res.status(200).json({
            success: false,
            message: "Wrong Password!",
        });
    }
    // See if user changing profile picture
    let profile_picture = '';
    let url = '';
    if (req.file) {
        if (findUser.profile_picture !== 'profile_pict.jpg') {
            console.log(findUser.profile_picture)
            await cloudinary.uploader.destroy(findUser.profile_picture, { resource_type: "image" }, function (error, result) {
                console.log(result, error)
            });
        }
        profile_picture = req.file.filename;
        url = req.file.path;
    }
    try {
        await findUser.update({
            firstName: firstName,
            lastName: lastName,
            gender: gender,
            phone_number: phone_number,
            profile_picture: profile_picture,
            url: url
        });
        return res.status(200).json({
            success: true,
            message: "Profile updated!",
            data: {
                firstName: findUser.firstName,
                lastName: findUser.lastName,
                email: findUser.email
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

module.exports.logout = (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({
        success: true,
        message: "Logout Success",
    });
};

// Transaction
module.exports.getUserTransactionPending = async function (req, res) {
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (decoded.UserId != req.params.id) {
            return res.status(401).json({
                success: false,
                message: "You don't have authorization"
            })
        }
        const pendingTransaction = await db.Transaction.findAll({
            where: {
                UserId: req.params.id,
                payment_status: 'pending'
            }, include: [
                {
                    model: db.Venue,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt']
                    }
                }
            ]
        })
        return res.status(200).json({
            success: true,
            data: pendingTransaction
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

module.exports.getUserTransactionSuccess = async function (req, res) {
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (decoded.UserId != req.params.id) {
            return res.status(401).json({
                success: false,
                message: "You don't have authorization"
            })
        }
        const successTransaction = await db.Transaction.findAll({
            where: {
                UserId: req.params.id,
                payment_status: {
                    [Op.or]: ['settlement', 'capture']
                }
            }, include: [
                {
                    model: db.Checkin_Status,
                    attributes: {
                        exclude: ['TransactionId', 'createdAt', 'updatedAt']
                    }
                },
                {
                    model: db.Venue,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt']
                    }
                }
            ]
        })
        return res.status(200).json({
            success: true,
            data: successTransaction
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

module.exports.getUserTransactionFinished = async function (req, res) {
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (decoded.UserId != req.params.id) {
            return res.status(401).json({
                success: false,
                message: "You don't have authorization"
            })
        }
        const finishedTransaction = await db.Transaction.findAll({
            where: {
                UserId: req.params.id,
                payment_status: 'finished'
            }, include: [
                {
                    model: db.Feedback,
                    attributes: ['id', 'rating', 'feedback_content']
                },
                {
                    model: db.Checkin_Status,
                    attributes: {
                        exclude: ['TransactionId', 'createdAt', 'updatedAt']
                    }
                },
                {
                    model: db.Venue,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt']
                    }
                }
            ]
        })
        return res.status(200).json({
            success: true,
            data: finishedTransaction
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}