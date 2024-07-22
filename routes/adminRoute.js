const express = require('express');
const admin_route = express.Router(); // Correctly use express.Router() for routes

const session = require('express-session');
const config = require('../config/config'); // Ensure config is imported before usage

admin_route.use(session({ secret: config.sessionSecret }));

const auth = require('../middleware/auth')

const bodyParser = require('body-parser');
admin_route.use(bodyParser.json()); // Correctly call bodyParser.json()
admin_route.use(bodyParser.urlencoded({ extended: true })); // Correctly call bodyParser.urlencoded()


const adminController = require('../controllers/adminController');

admin_route.get('/', adminController.loadLogin);
admin_route.post('/login', adminController.verifyLogin); 

admin_route.get('/home', adminController.loadDashBoard);
    
admin_route.get('/forget',auth.isLogout, adminController.forgetLoad);
admin_route.post('/forget', adminController.forgetVerify);

admin_route.get('/forget-password',auth.isLogout, adminController.forgetPasswordLoad);
admin_route.post('/forget-password', adminController.resetPassword);

admin_route.get('*', adminController.loadLogin);




module.exports = admin_route; // Correctly export admin_route
