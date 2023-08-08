const mongoose = require('mongoose')

const empSchema = new mongoose.Schema({
    firstname : {
        type:String,
        required:true
    },
    lastname : {
        type:String,
        required:true
    },
    email : {
        type:String,
        required:true,
        unique:true
    },
    username : {
        type:String,
        required:true,
        unique:true
    },
    password : {
        type:String,
        required:true,
        unique:true
    },
    cnfpassword : {
        type:String,
        required:true,
        unique:true
    },
    mobile : {
        type:Number,
        required:true,
        unique:false
    }
})




const Register = new mongoose.model("EmployeeInfo", empSchema)

module.exports = Register