const mongoose = require('mongoose')

const assetAddSchema = new mongoose.Schema({
    Category : {
        type:String,
        required:true
    },
    assetId : {
        type:Number,
        required:true
    },
    assetName : {
        type:String,
        required:true
    },
    purchaseDate : {
        type:Date,
        required:true,
    },
    aQty : {
        type:Number,
        required:true
    },
    costPrice : {
        type:Number,
        required:true,
    },
    assetLife : {
        type:Number,
        required:true,
    },
    purchaseReason : {
        type:String,
        required:true,
    }
})


const assetRegister = new mongoose.model("Asset_add_details", assetAddSchema)

module.exports = assetRegister