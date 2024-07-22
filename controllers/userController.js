const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomString=require('randomstring');
const config=require('../config/config')
//Load Page Register.
const loadRegister = async (req, res) => {
    try {
        res.render('registration');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};


// Insert User In Database.
const insertUser = async (req, res) => {
    try {
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            image: req.file.filename,
            password: hashedPassword,
            is_admin: 0
        });

        const userData = await user.save();

        if (userData) {
            sendVerifyMail(req.body.name, req.body.email, userData._id);
            res.render('registration', { message: "Your registration has been successfully completed. Please verify your email." });
        } else {
            res.render('registration', { message: "Your registration has failed." });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).render('registration', { message: "An error occurred during registration. Please try again." });
    }
};


// Send verification mail
const sendVerifyMail = async (name, email, user_id) => {
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
            subject: 'For Verification Mail',
            html: `<p>Hi <b>${name}</b>, please click here to <a href="http://localhost:2323/verify?id=${user_id}">verify</a> your email.</p><br>This Mail for testing Purpose 🌝<br> Your Brother is  Here Not Worrie If any situation you have.`
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


const verifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });
        console.log(updateInfo);
        res.render('email-verified');
    } catch (error) {
        console.error(error.message);
    }
};


// Login User method Start
const loginLoad = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}


const verifyLogin = async(req,res)=>{
    try {
        const email=req.body.email;
        const password=req.body.password
      const userData =await User.findOne({email:email})

      if (userData) {
        const passwordMatch = await bcrypt.compare(password,userData.password)
        if (passwordMatch) {
            req.session.user_id = userData._id    //set the user id in user_id
            res.redirect('/home')   
        }
        else{
            res.render('login',{message:"Email And Password Is Incorrected"})
            
        }
    } else {
        res.render('login',{message:"Email And Password Is Incorrected"})
        
      }

    } catch (error) {
        console.log(error.method)
    }
}


//isLogout
const userlogout = (req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}

//Load Home
const loadHome=async (req,res)=>{
    try {
      const userData = await User.findById({_id:req.session.user_id});

        res.render('home',{user:userData}) 
    } catch (error) {
        console.log(error.message)
    }
}

//forget password code
const forggetLoad=async(req,res)=>{
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message)
    }
}


// for reset password sent mail
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
            html: `<p>Hi <b>${name}</b>, please click here to <a href="http://localhost:2323/forget-password?token=${token}">Reset</a> Your Password .</p>`
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
// forget verifyt method 
const forgetVerify=async(req,res)=>{
    const randomStrings = randomString.generate();
    try {
        const email=req.body.email;
      const userData = await User.findOne({email:email})
      if(userData){
          if(userData.is_verified==0){
              
              res.render('forget',{message:"Please Verify Your Mail."});
            }
            else{
            const updatedData = await User.updateOne({email:email},{$set:{token:randomStrings}});
            sendResetPasswordMail(userData.name,userData.email,randomStrings)
            
            res.render('forget',{message:"Please Check Your mail To reset Your password."});

        }
      }
      else{
        res.render('forget',{message:"User Email is Incorrect."});
      }
    } catch (error) {
        console.log(error.message)
    }
}

// forget password Load 
const forgetPasswordLoad = async(req,res)=>{
    try {
        const token = req.query.token
       const tokenData = await User.findOne({token:token})

       if(tokenData){
            res.render('forget-password',{user_id:tokenData._id})
       }
       else{
        res.render('404',{message:"Token is Invalid"})
       }
    } catch (error) {
        console.log(error.message)
    }
}

// reset password data send

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
        throw new Error('Error securing password');
    }
};

const resetPassword = async(req,res)=>{
    try {
        const password = req.body.password
        const user_id = req.body.user_id

        const secure_password =await securePassword(password); 
      const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password},token:''})
      res.redirect('/')

    } catch (error) {
        console.log(error.message)
    }
}

//user profile edit and update
// const editLoad = async(req,res)=>{
//     try{
//        const id = req.query.id
//       const userData =await User.findById({_id:id})
//       if(userData){
//         res.render('edit',{user:userData})
//       }
//       else{
//         res.redirect('/home')
//       }
//     }
//     catch(error){
//         console.log(error.message)
//     }
// }

// const updateProfile = async(req,res)=>{
//     try {
//         if(req.file){

//             const userData = await User.findByIdAndUpdate({_id:req.body.user._id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mno,image:req.file.filename}})
//         }
//         else{
//          const userData = await User.findByIdAndUpdate({_id:req.body.user._id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mno}})
//         }
//         res.redirect('/home')
//     } catch (error) {
//         console.log(error.message)
//     }
// }

const editLoad = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById(id);
        if (userData) {
            res.render('edit', { user: userData });
        } else {
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const updateProfile = async (req, res) => {
    try {
        const userId = req.body.user_id;
        const updateData = {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
        };
        
        if (req.file) {
            updateData.image = req.file.filename;
        }

        await User.findByIdAndUpdate(userId, { $set: updateData });
        res.redirect('/home');
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userlogout,
    forggetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    editLoad,
    updateProfile
};
