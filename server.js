//jshint esversion:6

const bodyParser = require("body-parser");
const express = require('express');
const cors = require('cors');
const path = require('path')
const ejs = require("ejs");
const _ = require('lodash');
const app = express();
const { MongoClient } = require('mongodb');

// const mongoose = require('mongoose');
// const connection = "mongodb+srv://adarsh:2104@Cluster0/Cluster0?retryWrites=true&w=majority";
// mongoose.connect(connection, { useNewUrlParser: true,useUnifiedTopology: true, useFindAndModify: false });


// const blogSchema = new mongoose.Schema({
//   title:String,
//   content:String
// });
// const blog = mongoose.model("blog",blogSchema);


async function main(operationType, params) {
  const uri = "mongodb+srv://adarsh:2104@cluster0.xppwx.mongodb.net/mongo?retryWrites=true&w=majority";
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  let result;
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    if (operationType === 'get_all') {
      result = await showAllListing(client);
    }
    else if (operationType === 'get_post_by_params' && params) {
      result = await showAllListing(client, params);
    }

    else if (operationType === 'save_new_posts') {
      result = await createNewPost(client, params);
    }
    // Make the appropriate DB calls

    // Create a single new listing
    // await createListing(client,
    //     {
    //         name: "Lovely Loft",
    //         summary: "A charming loft in Paris",
    //         bedrooms: 1,
    //         bathrooms: 1
    //     }
    // );

    // Create 3 new listings
    // await createMultipleListings(client, [
    //     {
    //         name: "Infinite Views",
    //         summary: "Modern home with infinite views from the infinity pool",
    //         property_type: "House",
    //         bedrooms: 5,
    //         bathrooms: 4.5,
    //         beds: 5
    //     },
    //     {
    //         name: "Private room in London",
    //         property_type: "Apartment",
    //         bedrooms: 1,
    //         bathroom: 1
    //     },
    //     {
    //         name: "Beautiful Beach House",
    //         summary: "Enjoy relaxed beach living in this house with a private beach",
    //         bedrooms: 4,
    //         bathrooms: 2.5,
    //         beds: 7,
    //         last_review: new Date()
    //     }
    // ]);
  } finally {
    // Close the connection to the MongoDB cluster
    await client.close();
    return result;
  }
}

main().catch(console.error);

async function showAllListing(client, params) {
  if (!params) {
    params = {};
  }

  console.log('params=', params)
  const result = client.db("mongo").collection("blogs").find(params);


  const data = await result.toArray();
  return data;
}


async function createNewPost(client, params) {
  if (params) {

    console.log('params=', params)
    const result = await client.db("mongo").collection("blogs").insertOne(params);
    console.log(`New listing created with the following id: ${result.insertedId}`);
    return result.insertedId;
  }
}



const homeStartingContent = "They are men of steel, standing tall in the harshest of conditions. They disregard freezing cold temperatures and scorching heat to always remain brave, awake and devoted towards us.They are all heroes, each and every one of them. But there are a few whose stories have become the stuff of legends, stories that deserve to be shared and told over and over again:";
const aboutContent = "We believe that the support of our readers and followers are very crucial in attaining our objectives as a source of crisp and clear information. We thank you all for all the support and love that you have been showering us with. And we would like to iterate that the feeling is mutual. We hope to continue this relation in the many years to come.Please share your stories with our writers cover something in detail, please feel free to reach out to us on our email mentioned in the https://www.thebravehearts.in/contact section.";
const contactContent = "The Bravehearts is committed to providing the best and simplified content to its audience. If you wish to contact the admin of The Bravehearts you can drop us an email at admin@thebravehearts.com.We value feedback from you and thus if you wish to contact us you can send us an email on contact@thebravehearts.com. ";



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));

app.route("/")
  .get((req, res) => {
    main('get_all').then(posts => {
      console.log('data=', posts);
      res.render("home", { homeStartingContent: homeStartingContent, posts: posts })
    }).catch(console.error);
    // blog.find((err,post)=>{
    //   if (!err){
    //     posts = post;
    //   };

    // })

  });

app.route("/about")
  .get((req, res) => {
    res.render("about", { aboutContent: aboutContent })
  });

app.route("/contact")
  .get((req, res) => {
    res.render("contact", { contactContent: contactContent })
  })

app.route("/compose")
  .get((req, res) => { res.render("compose") })
  .post((req, res) => {
    // const post = new blog ({
    //   'title':req.body.postTitle,
    //   'content':req.body.postBody
    // });
    const post = {
      'title': req.body.postTitle,
      'content': req.body.postBody
    };

    main('save_new_posts', post).then(insertedPostId => {
      console.log('data=', insertedPostId);
      if (insertedPostId) { res.redirect("/"); }
    }
    ).catch(console.error);
    // post.save(err=>{
    //   if(!err){
    //     res.redirect("/");}

    //   }
    // );
  });

app.route("/posts/:id")
  .get((req, res) => {

    var ObjectId = require('mongodb').ObjectId;
    const id = req.params.id
    var o_id = new ObjectId(id);


    main('get_post_by_params', { _id: o_id }).then(currentPost => {
      console.log('data=', currentPost);
      res.render("post", { post: currentPost[0] })
    }
    ).catch(console.error);


    // blog.findById(id.toString(), function (err, currentPost) {
    //   if(!err){
    //     res.render("post",{post:currentPost})}
    // });

  });


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});