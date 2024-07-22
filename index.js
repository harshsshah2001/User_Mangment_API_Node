const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/user_managment_system')

const express=require('express')
const app=express();


// Set up view engine and views directory
app.set('view engine', 'ejs');
app.set('views','./views/users');

const useRoute=require('./routes/userRoute')
app.use('/',useRoute)

app.set('view engine', 'ejs');
app.set('views', './views/admin');

const adminRoute=require('./routes/adminRoute')
app.use('/admin',adminRoute)

app.listen(4848,()=>{
    console.log("server is Running")
})
