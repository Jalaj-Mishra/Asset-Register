const express = require('express')
require("./db/conn")
const path = require('path')
const Register = require("./models/registration")
const assetRegister = require("./models/Asset_add")
const assetDel = require("./models/Asset_del")
const app = express()
const {json} = require('express')
const { set } = require('mongoose')
const { validateHeaderValue } = require('http')
const port = process.env.PORT || 3000
app.use(express.static("../public"))
app.use(express.json())
app.use(express.urlencoded({extended:false}))



// Login Screen
app.get("/", (req,res)=>{
    res.render("index")
})



// New User Registration
app.post("/registration", async(req,res)=>{
    try{
        const password = req.body.password
        const cnfpassword = req.body.cnfpassword
        if(password === cnfpassword){
            const regEmp = new Register({
                username: req.body.username,
                password: req.body.password,
                cnfpassword: req.body.cnfpassword,
                email: req.body.email,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                mobile: req.body.mobile    
            }) 
 
            const registered = await regEmp.save()
            res.status(201).send("Succesfully Registered")
            
        }else{
            res.send("Password and Confirm password are not matching")
        }
    }catch(error){
        res.status(400).send(error)
    }
})



// Log in Validation
app.post("/login",async(req,res) => {
    try{
        const user = req.body.user
        const pass = req.body.pass

        console.log("Username :"+ user+"and Password is :"+pass)

        const usercheck = await Register.findOne({username:user, password:pass})
        console.log(usercheck)
        if(usercheck){
            res.redirect("home.html")
        }else{
            alert("Credentials are not matching")
        }
        
        


    }catch(error){
        res.status(400).send("Invalid credentials");
        
    }

})


// New Asset Registration
app.post("/asset-addition", async(req,res)=>{
    try{
        const newAsset = new assetRegister({
            Category: req.body.category,
            assetId: req.body.id,
            assetName: req.body.assName,
            purchaseDate: req.body.pDate,
            aQty: req.body.assetQty,
            costPrice: req.body.assetCp,
            assetLife: req.body.assetUL,
            purchaseReason: req.body.pReason    
        }) 
        console.log(newAsset)
        const asset = await newAsset.save()
        res.status(201).send("New Asset has Succesfully Registered")
    }catch(error){
        res.status(400).send(error)
    }
})


// Asset Deletion
app.post("/asset-deletion", async(req,res)=>{
    try{
        const delAsset = new assetDel({
            approval: req.body.appY,
            refNo: req.body.refNumber,
            empUser: req.body.user,
            assetId: req.body.id,
            assetQuantity: req.body.Qty,
            remarkDel: req.body.remarks
        })
        console.log(delAsset)
        const dAsset = await delAsset.save()
        res.status(201).send("Asset has Deleted")
    }catch(error){
        res.status(400).send(error)
    }
})

// Fetching Asset Register
app.post("/fetchassets", async(req, res)=>{
    try{
        const assetData = await assetRegister.find({})
        res.status(200).json({assetData})
    }catch(error){
        req.send("invalid request")
    }
})   







// Port Listening 
app.listen(port, ()=>{
    console.log("Server is running at port no: "+port)
})


// Depreciation formula
// var dep_per = 100 / req.body.assetUL                                 // Depreciation percentage
 
// var dep_days = today - req.body.pDate                          //  No. of Days for Depreciation


// var value = req.body.assetCp 
// var dep_amt = (dep_days * dep_per * value) / 100            //  Amount to be Depreciated of Asset

// console.log(dep_amt)