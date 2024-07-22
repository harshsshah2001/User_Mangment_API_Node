const User = require('../models/userModel')
const randomstring=require('randomstring')
const config=require('../config/config')
const bcrypt = require('bcrypt')
const session=require('express-session')
const nodemailer= require('nodemailer')
const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS:true,
            auth: {
                user: config.emailUser,
                pass: config.emailpassword
            }
        });

        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password',
            html: `<p>Hi <b>${name}</b>, please click here to <a href="http://localhost:2323/admin/forget-password?token=${token}">Reset</a> Your Password .</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

    } catch (error) {
        console.error('Error in sendVerifyMail:', error.message);
    }
};

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
        throw new Error('Error securing password');
    }
};

const loadLogin = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin == 0) {
                    res.render('login', { message: "You are not admin" });
                } else {
                    req.session.user_id = userData._id;
                    res.redirect('/admin/home');
                }
            } else {
                res.render('login', { message: "Email and Password are Incorrect" });
            }
        } else {
            res.render('login', { message: "Email and Password are Incorrect" });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const loadDashBoard = async (req, res) => {
    try {
      const userData = await User.findById({_id:req.session.user_id})
      res.render('home',{admin:userData})
        res.render('home'); // Ensure 'home.ejs' is in the correct views directory

    } catch (error) {
        console.log(error.message);
    }
};

//forgot load

const forgetLoad = async(req,res)=>{
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message)
    }
}

const forgetVerify = async(req,res)=>{
    try {
        const email = req.body.email
        
      const userData= await User.findOne({email:email})

      if (userData) {
        const randomString=randomstring.generate();
       const updatedData =await User.updateOne({email:email},{$set:{token:randomString}})
       sendResetPasswordMail(userData.name,userData.email,randomString)
       res.render('forget',{message:"please Check Your mail to reset Your password"})
      } else {
            res.render('forget',{message:"Email is incorrect"})
      }
    } catch (error) {
        console.log(error.message)
    }
}

//forgetPasswordLoad 
const forgetPasswordLoad =async(req,res)=>{
    try {
        const token = req.query.token
      const tokenData = await User.findOne({token:token})
      if(tokenData){
            res.render('forget-password',{user_id:tokenData._id})
      }
      else{
        res.render('404',{message:"Invalid Link"})
      }
    } catch (error) {
        console.log(error.message)
    }
}


const resetPassword = async(req,res)=>{
    try {
        const password = req.body.password;
        const user_id=req.body.user_id

        const securePass = await securePassword(password)
      const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:securePass,token:''}})
      req.session.user_id = userData._id
      res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}
module.exports = {
    loadLogin,
    verifyLogin,
    loadDashBoard,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword
}