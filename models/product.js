const mongoose = require ('mongoose')

// product schema

const  productSchema = mongoose.Schema({
    title:{
        type: String,
        required:true
    },
  slug:{
        type: String,
        
    },
 desc:{
        type: String,
        required:true
    },
    category:{
        type: String,
        required:true
    }
    ,price:{
        type: Number,
        required:true
    },
    image:{
        type:String
    }

})
module.exports= mongoose.model('Product', productSchema)