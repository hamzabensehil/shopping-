const mongoose = require ('mongoose')
//category schema

const CategorySchema = mongoose.Schema({
    title:{
        type: String,
        required:true
    },
  slug:{
        type: String,
        
    },
 
   
})

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema)