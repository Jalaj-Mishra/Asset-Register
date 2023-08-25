const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://mjalaj77:jalajhostingdb@cluster0.vvxtrbj.mongodb.net/", {
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(() => {
    console.log("connection sucessful")
}).catch((e) => {
    console.log(e)
})

