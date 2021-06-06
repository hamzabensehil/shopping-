const express =require ('express')
const mongoose =require('mongoose')
const dotenv = require ('dotenv')
require('dotenv').config()
const path =require ('path')
const config = require ('./config/database')
const bodyparser = require ('body-parser')
const session = require ('express-session')
 const expressValidator = require('express-validator')
 const fileupload =require('express-fileupload')
 const passport = require ('passport')
// init app
const app =express()


// connect batabase
mongoose.connect(config.database, {
     useNewUrlParser: true ,
     useUnifiedTopology: true })
.then((_) => console.log("Connected to DB"))
.catch((err) => console.error("error", err));


// view engine setup
app.set('views',path.join(__dirname, 'views'))
app.set ('view engine','ejs')

// set public folder
app.use(express.static(path.join(__dirname,'public')))

//  set global errors variable
app.locals.errors =null
// get page models
const Page = require('./models/page')
Page.find({}).sort({sorting:1}).exec((err,pages)=>{
    if (err){
        console.log(err)
    }else{
        app.locals.pages = pages
    }

})
// get category models
const Category = require('./models/category')
Category.find(function(err,categories){
    if (err){
        console.log(err)
    }else{
        app.locals.categories = categories
    }

})

// express fileupload middlware
app.use(fileupload())

// body-parser middleware
app.use(bodyparser.urlencoded({extended:false}))

app.use (bodyparser.json())

// express session 
app.use(session({
    secret:'hamza',
    resave:true,
    saveUninitialized:true,
    // cookie:{secure:true}
}))
// express validator
app.use(expressValidator({
    errorFormatter:(param, msg, value)=>{
        const namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root
        while(namespace.lenght){
            formParam +='['+ namespace.shift( +']')
        }
        return{
            param :formParam,
            msg :msg,
            value :value
        }
    },
    // custom validator
customValidators:{
    isImage : function (value,filename) {
        const extension = (path.extname(filename)).toLocaleLowerCase()
        switch (extension){
          case   '.jpg' :
              return'.jpg'
          case   '.jpeg' :   
              return'.jpeg'
          case   '.png' :    
              return'.png'
          case   '' :    
              return'.jpg' 
        }
       
    }
}
}))
// set express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// passport middleware
require('./config/passport')(passport)
app.use (passport.initialize())
app.use(passport.session())

  
app.get('*',(req,res,next)=>{
    res.locals.cart =req.session.cart
    res.locals.user = req.user||null
    next()
})


// set routes
const pages = require('./routes/pages.js')
const cart = require('./routes/cart.js')
const users = require('./routes/users')
const products = require('./routes/products.js')
const adminpages = require('./routes/admin_pages.js')
const adminCategories = require('./routes/admin_Categories.js')
const adminProducts = require('./routes/admin_products.js')
app.use('/admin/pages', adminpages)

app.use('/admin/categories', adminCategories)
app.use('/admin/products', adminProducts)
app.use('/products', products)
app.use('/cart', cart)
app.use('/users', users)
app.use('/', pages)


app.use(express.static(__dirname + '/public'));
app.use('/css',express.static(path.resolve(__dirname,'public/css')));
app.use('/js',express.static(path.resolve(__dirname,'public/js')));


// start the server 

app.set('port', process.env.PORT || 4000);
const port = process.env.PORT
app.listen(port,()=>{
    console.log('running on port '+ port)
})