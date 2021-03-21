//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/blogs", { useNewUrlParser: true,useUnifiedTopology: true });

const blogSchema = new mongoose.Schema({
  title:String,
  content:String
});

const blog = mongoose.model("blog",blogSchema);

const homeStartingContent = "They are men of steel, standing tall in the harshest of conditions. They disregard freezing cold temperatures and scorching heat to always remain brave, awake and devoted towards us.They are all heroes, each and every one of them. But there are a few whose stories have become the stuff of legends, stories that deserve to be shared and told over and over again:";
const aboutContent = "We believe that the support of our readers and followers are very crucial in attaining our objectives as a source of crisp and clear information. We thank you all for all the support and love that you have been showering us with. And we would like to iterate that the feeling is mutual. We hope to continue this relation in the many years to come.Please share your stories with our writers cover something in detail, please feel free to reach out to us on our email mentioned in the https://www.thebravehearts.in/contact section.";
const contactContent = "The Bravehearts is committed to providing the best and simplified content to its audience. If you wish to contact the admin of The Bravehearts you can drop us an email at admin@thebravehearts.com.We value feedback from you and thus if you wish to contact us you can send us an email on contact@thebravehearts.com. ";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.route("/")
.get((req,res)=>{
  let posts = []
  blog.find((err,post)=>{
    if (!err){
      posts = post;
    };
    res.render("home",{homeStartingContent:homeStartingContent,posts:posts});
  })

});

app.route("/about")
.get((req,res)=>{
  res.render("about",{aboutContent:aboutContent})
});

app.route("/contact")
.get((req,res)=>{
  res.render("contact",{contactContent:contactContent})
})

app.route("/compose")
.get((req,res)=>{res.render("compose")})
.post((req,res)=>{
  const post = new blog ({
    'title':req.body.postTitle,
    'content':req.body.postBody
  });
  post.save(err=>{
    if(!err){
      res.redirect("/");}

    }
  );
});

app.route("/posts/:id")
.get((req,res)=>{
  const id = req.params.id
  blog.findById(id.toString(), function (err, currentPost) {
    if(!err){
      res.render("post",{post:currentPost})}
  });

});






app.listen(3005, function() {
  console.log("Server started on port 3005");
});
