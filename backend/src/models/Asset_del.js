const mongoose = require("mongoose")

const assetDelSchema = new mongoose.Schema({
    approval : {
        type:String,
        required:true
    },
    refNo : {
        type:Number,
        required:true
    },
    empUser : {
        type:String,
        required:true
    },
    assetId : {
        type:Number,
        required:true
    },
    assetQuantity : {
        type:Number,
        required:true
    },
    remarkDel : {
        type:String,
        required:true
    }
})


const assetDel = new mongoose.model("Asset_del_details", assetDelSchema)

module.exports = assetDel