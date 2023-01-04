// common thing
require("dotenv").config();
var exp = require("express");
var bodyParser = require("body-parser");
var https = require("https");
var mongoose = require("mongoose");
var encrypt = require("mongoose-encryption");
// const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

var app = exp();
app.use(exp.static("public"));
app.use(bodyParser.urlencoded({extended : true}));
app.set('view engine', 'ejs');

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost:27017/userDb", {useNewUrlParser : true});

const userSchema = new mongoose.Schema({
    name : String,
    password : String
});

// console.log(md5("12345"));

// const secret_key = "this is the secret key."; 
userSchema.plugin(encrypt, {secret : process.env.SECRET, encryptedFields : ["password"]});

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res)
{
    res.render("home");
});

app.get("/login", function(req, res)
{
    res.render("login");
});

app.post("/login", function(req, res)
{
    const userName = req.body.username;
    // const passWord = md5(req.body.password);
    const passWord = req.body.password;

    // console.log(passWord);

    User.findOne({"name" : userName}, function(err, result)
    {
        if(err)console.log(err);
        else 
        {
            bcrypt.compare(passWord, result.password, function(err, result2) 
            {
                // result2 == true
                if(result2 === true)
                {
                    res.render("secrets")
                }
                else
                {
                    console.log("password doesn't matched !!");
                    res.render("home");
                }
            });
        }
    })
});

app.get("/register", function(req, res)
{
    res.render("register");
});

app.post("/register", function(req, res)
{
    const userName = req.body.username;
    // const passWord = md5(req.body.password);
    const passWord = req.body.password;

    bcrypt.hash(passWord, saltRounds, function(err, hash) 
    {
        // Store hash in your password DB.
        const newUser = new User({name : userName, password : hash});

        User.findOne({"name" : userName}, function(err, result)
        {
            if(err)console.log(err);
            else 
            {
                if(result)
                {
                    console.log("user already exists");
                    
                    res.render("login");
                }
                else
                {
                    newUser.save();
                    console.log("new user registered successfully");

                    res.render("login");
                }
            }
        })
    });
});

app.listen(3000, function(err)
{
    if(err)console.log(err);
    else console.log("server started succesfully at port 3000");
});