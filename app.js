var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var seedDB = require("./seeds");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user");
var flash = require("connect-flash");

var mongoose = require("mongoose");

var commentRoutes = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	indexRoutes = require("./routes/index");
var methodOverride = require("method-override");


mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
mongoose.connect(url);


// seedDB();


const axios = require('axios');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method"));
//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "He is a fish.",
	resave:false,
	saveUninitialized:false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
})



app.use("/",indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


app.listen(process.env.PORT || 4000, process.env.IP, function(){
	console.log("Server started!!!");   
});