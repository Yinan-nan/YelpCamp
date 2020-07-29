var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware/index.js");

router.get("/new", middleware.isLoggedIn, function(req, res) {
	res.render("campgrounds/new");
})
router.get("/", function(req,res){
	//console.log(res);
	Campground.find({}, function(err, allcampgrounds) {
		if(err) {
			console.log(err);
		} else{
			res.render("campgrounds/index",{campgrounds: allcampgrounds, currenUser:req.user});
		}
	})
});

router.post("/", middleware.isLoggedIn,function(req, res){
	//res.send("You hit the post route");
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCampground = {name: name, price: price, image: image, description: desc, author: author};
	// campgrounds.push(newCampgound);
	//create a new campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		}else{
			res.redirect("/campgrounds");
		}
	})
});

router.get("/:id", function(req, res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error","Campground not found");
			res.redirect("back");
		} else{
			// console.log(req.user);
			// console.log(foundCampground.comments);
			res.render("campgrounds/show", {campground: foundCampground});
		}
	})
});

//Edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership,function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit",{campground: foundCampground});
	});	
})

router.put("/:id",middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
});

//destroy campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	if(req.isAuthenticated()){
		Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	})
	}
	
})




module.exports = router;