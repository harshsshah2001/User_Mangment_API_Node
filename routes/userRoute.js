const express = require('express');
const user_route = express.Router();

const userController = require('../controllers/userController');

const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

const config = require("../config/config")

const auth = require('../middleware/auth')

const session = require('express-session')
user_route.use(session({secret:config.sessionSecret}));

const multer = require('multer');
const path = require('path');
user_route.use(express.static('public'))

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname,'../public/userImages'));
    },
    filename: function (req, file, cb) {
        const name = Date.now()+ '-' +file.originalname;
        cb(null, name);
    }
});
const upload = multer({ storage: storage });

// Define routes
user_route.get('/register',auth.isLogout, userController.loadRegister);
user_route.post('/register', upload.single('image'), userController.insertUser);

user_route.get('/verify',userController.verifyMail)

user_route.get('/',auth.isLogout,userController.loginLoad)
user_route.get('/login',auth.isLogout,userController.loginLoad)
user_route.post('/login',userController.verifyLogin)
user_route.get('/logout',auth.isLogin,userController.userlogout)

user_route.get('/home',auth.isLogin,userController.loadHome)

user_route.get('/forget',auth.isLogout,userController.forggetLoad)
user_route.post('/forget',userController.forgetVerify)

user_route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad)
user_route.post('/forget-password',userController.resetPassword)

user_route.get('/edit',auth.isLogin,userController.editLoad)

user_route.post('/edit',upload.single('image'),userController.updateProfile)

module.exports = user_route;

