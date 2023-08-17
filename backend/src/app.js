const express = require('express')
require("./db/conn")
const path = require('path')
const Register = require("./models/registration")
const assetRegister = require("./models/Asset_add")
const assetDel = require("./models/Asset_del")
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const app = express()
const {json} = require('express')
const { set } = require('mongoose')
const { validateHeaderValue } = require('http')
const port = process.env.PORT || 4000
const cors = require("cors")
const { count } = require('console')
app.use(express.static("../public"))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cors())


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


// Asset Deletion or Updation
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
        
        // console.log(delAsset)
        const dAsset = await delAsset.save()

        //Update Asset quantity
        const predata= await assetRegister.find({assetId:req.body.id});
        const update= await assetRegister.updateOne({assetId:req.body.id},{$set:{aQty:predata[0].aQty-req.body.Qty }});
        
        res.status(201).send("Asset has Deleted")
    }catch(error){
        res.status(400).send(error)
    }
})



// // Fetching Asset Register
// app.get("/fetchassets", async(req, res)=>{
//     try{
//         const assetData = await assetRegister.find({})
//         res.status(200).json({assetData})
//     }catch(error){
//         req.send("invalid request")
//     }
// })   


//Fetching Assets.
app.get('/fetchassets', async(req, res) => {
    // Set response header for CSV download
    const data = await assetRegister.find({})
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=data.csv');
  
    // Create CSV writer
    const csvWriter = createCsvWriter({
      path: 'data.csv',
      header: [
        { id: 'Category', title: 'Category' },
        { id: 'assetId', title: 'Id' },
        { id: 'assetName', title: 'Name' },
        { id: 'purchaseDate', title: 'pDate' },
        { id: 'aQty', title: 'Quantity' },
        { id: 'costPrice', title: 'CostPrice' },
        { id: 'assetLife', title: 'Usefull_Life' },
        { id: 'purchaseReason', title: 'PReason' },
      ],
    });
  
    // Write the data to CSV
    csvWriter.writeRecords(data)
      .then(() => {
        console.log('CSV file created successfully');
        res.sendFile('data.csv', { root: __dirname });
      })
      .catch(error => {
        console.error('Error creating CSV file:', error);  
        res.status(500).send('Error creating CSV file');
      });
  });



//------------------------------------------------------------------------------------------------------------------//
//Depreciation formula                                                                                              //
// var dep_per = 100 / req.body.assetUL                                // Depreciation percentage                   //
//                                                                                                                  //
// var dep_days = today - req.body.pDate                               //  No. of Days for Depreciation             //
//                                                                                                                  //
// var value = req.body.assetCp                                                                                     //
//                                                                                                                  //
// var dep_amt = (dep_days * dep_per * value) / 100                    //  Amount to be Depreciated of Asset        //
//------------------------------------------------------------------------------------------------------------------//


//Depreciation calculation.
app.post('/depreciation', async(req, res) => {
    // Set response header for CSV download
    const data = await assetRegister.find({})
    
    const count = await assetRegister.countDocuments();          // Counting total number of rows in the collection.
    // console.log(count) 

    
    //Initialization of arrays.
    var arr_dep_per = []
    var arr_dep_amt = []

    //loop for calculate dep_per and dep_amt for every tuple.
    for(i=0;i<count;i++){

        const asset_life = data[i]["assetLife"]

        const dep_percent = 100/asset_life
        // console.log("Depreciation percentage is :", dep_percent,"%")
        arr_dep_per.push(dep_percent)

        const assetCp = data[i]["costPrice"]
        // console.log("Asset cost price is :", assetCp,"rs.")
        
        const assetPd = new Date(data[i]["purchaseDate"])
        // console.log(assetPd)

        const tillDate = new Date(req.body.tilldate)
        // console.log(tillDate)

        const dates_Diff = tillDate - assetPd

        const dep_Days = Math.floor(dates_Diff / (1000 * 60 * 60 * 24));
        // console.log("Number of days in which the asset is depreciated are :", dep_Days)

        const dep_Amount = (dep_Days*dep_percent*assetCp)/100
        // console.log("Depreciation amount for this asset will be :", dep_Amount,"rs.")
        arr_dep_amt.push(dep_Amount)

        
    }

    // console.log(arr_dep_amt)
    // console.log(arr_dep_per)
    

    //loop for adding dep_per and dep_amt in the data.
    for(i=0;i<count;i++){
        data[i]["dep_percent"] = arr_dep_per[i]
        data[i]["dep_Amount"] = arr_dep_amt[i]
    }
    

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=data.csv');
  
    // Create CSV writer
    const csvWriter = createCsvWriter({
      path: 'data.csv',
      header: [
        { id: 'Category', title: 'Category' },
        { id: 'assetId', title: 'Id' },
        { id: 'assetName', title: 'Name' },
        { id: 'purchaseDate', title: 'pDate' },
        { id: 'aQty', title: 'Quantity' },
        { id: 'costPrice', title: 'CostPrice' },
        { id: 'assetLife', title: 'Usefull_Life' },
        { id: 'purchaseReason', title: 'PReason' },
        { id: 'dep_percent', title: 'dep_%' },
        { id: 'dep_Amount', title: 'dep_Amt.' },
      ],
    });
  
    // Write the data to CSV
    csvWriter.writeRecords(data)
      .then(() => {
        console.log('CSV file created successfully');
        res.sendFile('data.csv', { root: __dirname });
      })
      .catch(error => {
        console.error('Error creating CSV file:', error);  
        res.status(500).send('Error creating CSV file');
      });
  });



// Port Listening.
app.listen(port, ()=>{
    console.log("Server is running at port no: "+port)
})


