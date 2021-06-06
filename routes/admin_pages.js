const express = require ('express')
const router = express.Router()
const mongoose = require ('mongoose')
const Page= require('../models/page')
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;


// get page index

router.get('/',isAdmin, (req, res) => {
   Page.find({}).sort({sorting:1}).exec(function(err,pages){
res.render('admin/pages',{
  pages:pages
})
   })
  });
//   get add page
  router.get('/add-page', (req, res) => {
      const title =""
     const slug =""
      const content =""
     res.render('admin/add_page',{
         title:title,
         slug:slug,
         content:content
         
     })
});             
//   get edit page
router.get('/edit-page/:id', (req, res) => {
 Page.findById(req.params.id, (err,page)=>{
   if (err)return
   console.log(err)
  
 
 res.render('admin/edit_page',{
     title:page.title,
     slug:page.slug,
     content:page.content,
     id :page._id
     })
 })
});  





// post add page
  
  router.get('/',isAdmin, (req, res) => {
    res.send('admin area')
  });


//  post add page
  router.post('/add-page',isAdmin, (req, res) => {
      req.checkBody('title','title must have a value').notEmpty()
      req.checkBody('content','content must have a value').notEmpty()
      const title = req.body.title
      const slug = req.body.slug.replace(/\s+/g, '-').toLowerCase()
    // if (slug == "")slug = title.replace(/\s+/g, '-').toLowerCase()
       const content = req.body.content


  const errors= req.validationErrors()
 
if (errors){
   console.log(errors)
 
   res.render('admin/add_page',{

       errors:errors,
         title:title,
         slug:slug,
         content:content
         
     })
   
}else{
   Page.findOne({slug: slug},function (err,page){
     if(page){
       req.flash('danger','page slug exist')
       res.render('admin/add_page',{
          title:title,
          slug:slug,
          content:content
          
      })

     }else{
       const page = new Page({
        title:title,
        slug:slug,
        content:content,
        sorting:0

       })
      page.save(function(err){
         if (err)
         return console.log(err)

Page.find({}).sort({sorting:1}).exec(function(err,pages){
if (err){
  console.log(err)
}else{
req.app.locals.pages = pages
}
})

         req.flash('success')
         res.redirect('/admin/pages')
       })
     }

   })
} 
})
// post edit page
router.post('/edit-page/:id', isAdmin, (req, res) =>{

  req.checkBody('title', 'Title must have a value.').notEmpty();
  req.checkBody('content', 'Content must have a value.').notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug == "")
      slug = title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
      res.render('admin/edit_page', {
          errors: errors,
          title: title,
          slug: slug,
          content: content,
          id: id
      });
  } else {
      Page.findOne({slug: slug, _id: {'$ne': id}}, function (err, page) {
          if (page) {
              req.flash('danger', 'Page slug exists, choose another.');
              res.render('admin/edit_page', {
                  title: title,
                  slug: slug,
                  content: content,
                  id: id
              });
          } else {

              Page.findById(id, function (err, page) {
                  if (err)
                      return console.log(err);

                  page.title = title;
                  page.slug = slug;
                  page.content = content;

                  page.save(function (err) {
                      if (err)
                          return console.log(err);

                      Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                          if (err) {
                              console.log(err);
                          } else {
                              req.app.locals.pages = pages;
                          }
                      });


                      req.flash('success', 'Page edited!');
                      res.redirect('/admin/pages/edit-page/' + id);
                  });

              });


          }
      });
  }

});
// get delete page 

router.get('/delete-page/:id',isAdmin, (req, res) => {
  Page.findByIdAndRemove(req.params.id,(err)=>{
    if (err)return console.log(err)
    Page.find({}).sort({sorting:1}).exec(function(err,pages){
      if (err){
        console.log(err)
      }else{
      req.app.locals.pages = pages
      }
      })
req.flash('success','Page delated!')
res.redirect('/admin/pages/')
  


  })
 })

// export
module.exports = router