var express = require("express"),
    app = express(),
    methodOverride = require("method-override"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    mongoose = require("mongoose");

//APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    created:{type:Date,default:Date.now}
});

var Blog = mongoose.model("Blog",blogSchema);

//RESTFUL ROUTES

//INDEX ROUTE
app.get("/",function(req, res) {
    res.redirect("/blogs");   
});

app.get("/blogs",function(req,res){
    Blog.find({},function(err,blogs){
        if(err){
            console.log("ERROR");
        }
        else{
           res.render("index",{blogs:blogs}); 
        }
    });
});

//NEW ROUTE
app.get("/blogs/new",function(req, res) {
   res.render("new"); 
});

//CREATE ROUTE
app.post("/blogs",function(req,res){
    //create blog
    console.log(req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body);
    console.log("-------------------");
    console.log(req.body);
    Blog.create(req.body.blog,function(err,newBlog){
        if(err){
            res.render("new");
        }else{
            res.redirect("/blogs");
        }        
    });
});

//SHOW ROUTE
app.get("/blogs/:id",function(req, res) {
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            console.log("couldnt find id");
            res.redirect("/");
        } else{
            res.render("show",{blog:foundBlog})
        }
    })
    
});

//Edit Route
app.get("/blogs/:id/edit",function(req, res) {
    Blog.findById(req.params.id,function(err,foundBlog){
       if(err){
           res.redirect("/blogs");
       }else{
           res.render("edit",{blog:foundBlog})
       }
    });
});

//Update Route
app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
       if(err){
           res.redirect("/blogs");
       } 
       else{
           res.redirect("/blogs/"+req.params.id);
       }
    });
});

//DELETE ROUTE
app.delete("/blogs/:id",function(req,res){
    //destory blog
    Blog.findByIdAndRemove(req.params.id,function(err){
       if(err){
           res.redirect("/blogs");
       }else{
           res.redirect("/blogs");   
       }
    });
});

app.listen(process.env.PORT, process.env.IP,function(){
   console.log("SERVER IS RUNNING");
});