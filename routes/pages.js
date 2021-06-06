const express = require ('express')
const router = express.Router()
const Page= require('../models/page')

// 


router.get('/', (req, res) => {
   
  Page.findOne({slug:'home'},function(err,page){
    if (err)
console.log(err)

      res.render('index',{
      title:Page.title,
      content:Page.content
      })
   
  }) 
   
  });
// get a page

router.get('/:slug', function (req, res) {

    var slug = req.params.slug;

    Page.findOne({slug: slug}, function (err, page) {
        if (err)
            console.log(err);
        
        if (!page) {
            res.redirect('/');
        } else {
            res.render('index', {
                title: page.title,
                content: page.content
            });
        }
    });

    
});




// export
module.exports = router