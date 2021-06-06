const express = require ('express')
const router = express.Router()
const mongoose = require ('mongoose')
const mkdirp = require ('mkdirp')
const fs = require ('fs-extra')
const resizeImg = require ('resize-img')
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;
// get product model
const Product= require('../models/product')
// get Category model

 const Category = require('../models/category')
const category = require('../models/category')

// get products index

router.get('/', (req, res) => {
   var count
 Product.count((err,c) =>{
count = c
 })
Product.find (function(err, products){
res.render('admin/products',{
  products:products,
  count:count
})
})
})
//   get add product
  router.get('/add-product', (req, res) => {
      const title =""
     const desc =""
      const price =""
      category.find((err,categories)=>{
         res.render('admin/add_product',{
         title:title,
        desc:desc,
         categories:categories,
         price: price
         
        })
      })
    
});             
//   get edit product
router.get('/edit-product/:id', (req, res) => {
var errors
if (req.session.errors)errors =req.session.errors
req.session.errors =null

category.find((err,categories)=>{
    Product.findById(req.params.id,(err,p)=>{
        if (err){
console.log(err)
res.redirect('/admin/products')
        }else{
            
         var galleryDir = 'public/product_images/'+ p._id + '/gallery'
  
         var galleryImages = null
         fs.readdir(galleryDir,(err,files)=>{
             if (err){
                console.log(err)
             }else{
galleryImages =files
res.render('admin/edit_product',{
    title:p.title,
    errors:errors,
   desc:p.desc,
    categories:categories,
    category:p.category.replace(/\s+/g, '-').toLowerCase(),
    price:parseFloat( p.price).toFixed(2),
    image:p.image,
    galleryImages:galleryImages,
    id:p._id

    
   })
             }
         })
        }
    })
 
 })


});  

// post add product
router.post('/add-product', function (req, res) {

  var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

  req.checkBody('title', 'Title must have a value.').notEmpty();
  req.checkBody('desc', 'Description must have a value.').notEmpty();
  req.checkBody('price', 'Price must have a value.').isDecimal();
  req.checkBody('image', 'You must upload an image').isImage(imageFile);

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var desc = req.body.desc;
  var price = req.body.price;
  var category = req.body.category;

  var errors = req.validationErrors();

  if (errors) {
      Category.find(function (err, categories) {
          res.render('admin/add_product', {
              errors: errors,
              title: title,
              desc: desc,
              categories: categories,
              price: price
          });
      });
  } else {
      Product.findOne({slug: slug}, function (err, product) {
          if (product) {
              req.flash('danger', 'Product title exists, choose another.');
              Category.find(function (err, categories) {
                  res.render('admin/add_product', {
                      title: title,
                      desc: desc,
                      categories: categories,
                      price: price
                  });
              });
          } else {

              var price2 = parseFloat(price).toFixed(2);

              var product = new Product({
                  title: title,
                  slug: slug,
                  desc: desc,
                  price: price2,
                  category: category,
                  image: imageFile
              });
              product.save( (err)=> {
                
                if (err)
                    return console.log(err);

                mkdirp('public/product_images/' + product._id).then((err)=>console.log(err));

                mkdirp('public/product_images/' + product._id + '/gallery').then((err)=>console.log(err));
                
                mkdirp('public/product_images/' + product._id + '/gallery/thumbs').then(
                    (err) => {
                        console.log(err);
                        if (imageFile != "") {
                            var productImage = req.files.image;

                            var path = 'public/product_images/' + product._id + '/' + imageFile;

                            productImage.mv(path, (err) => {
                                return console.log(err);
                            });
                        }
                    }
                );
                req.flash('success', 'Product added!');
                res.redirect('/admin/products');
            });
        }
      });
  }

});

                     


// post edit product
  
router.post('/edit-product/:id', function (req, res) {

  var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

  req.checkBody('title', 'Title must have a value.').notEmpty();
  req.checkBody('desc', 'Description must have a value.').notEmpty();
  req.checkBody('price', 'Price must have a value.').isDecimal();
  req.checkBody('image', 'You must upload an image').isImage(imageFile);

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var desc = req.body.desc;
  var price = req.body.price;
  var category = req.body.category;
  var pimage = req.body.pimage;
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
      req.session.errors = errors;
      res.redirect('/admin/products/edit-product/' + id);
  } else {
      Product.findOne({slug: slug, _id: {'$ne': id}}, function (err, p) {
          if (err)
              console.log(err);

          if (p) {
              req.flash('danger', 'Product title exists, choose another.');
              res.redirect('/admin/products/edit-product/' + id);
          } else {
              Product.findById(id, function (err, p) {
                  if (err)
                      console.log(err);

                  p.title = title;
                  p.slug = slug;
                  p.desc = desc;
                  p.price = parseFloat(price).toFixed(2);
                  p.category = category;
                  if (imageFile != "") {
                      p.image = imageFile;
                  }

                  p.save(function (err) {
                      if (err)
                          console.log(err);

                      if (imageFile != "") {
                          if (pimage != "") {
                              fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                  if (err)
                                      console.log(err);
                              });
                          }

                          var productImage = req.files.image;
                          var path = 'public/product_images/' + id + '/' + imageFile;

                          productImage.mv(path, function (err) {
                              return console.log(err);
                          });

                      }

                      req.flash('success', 'Product edited!');
                      res.redirect('/admin/products/edit-product/' + id);
                  });

              });
          }
      });
  }

});

// post edit page
router.post('/edit-page/:slug', (req, res) => {
  req.checkBody('title','title must have a value').notEmpty()
  req.checkBody('content','content must have a value').notEmpty()
  const title = req.body.title
  const slug = req.body.slug.replace(/\s+/g, '-').toLowerCase()
// if (slug == "")slug = title.replace(/\s+/g, '-').toLowerCase()
   const content = req.body.content
   const id = req.body.id


const errors= req.validationErrors()

if (errors){
console.log(errors)

res.render('admin/edit_page',{

   errors:errors,
     title:title,
     slug:slug,
     content:content,
     id :id
     
 })

}else{
Page.findOne({slug: slug, _id:{'$ne':id}},function (err,page){
 if(page){
   req.flash('danger','page slug exist')
   res.render('admin/add_page',{
      title:title,
      slug:slug,
      content:content,
      id:id
      
  })

 }else{
  Page.findById(id ,(err,page)=>{
    if (err)
    return console.log(err)
    page.title=title
    page.slug=slug
    page.contnt=content
      page.save(function(err){
     if (err)
     return console.log(err)
     req.flash('success','page added')
     res.redirect('/admin/pages')
   })
  })

 }

})
}

});
// get delete page 

router.get('/delete-page/:id', (req, res) => {
  Page.findByIdAndRemove(req.params.id,(err)=>{
    if (err)return console.log(err)
req.flash('success','Page delated!')
res.redirect('/admin/pages/')
  


  })
 })

// export
module.exports = router