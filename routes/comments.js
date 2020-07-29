
//==================
//Comment route
//==================
var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware/index.js");



router.get("/new", middleware.isLoggedIn, function(req,res){
	Campground.findById(req.params.id, function(err, campground) {
		if(err || !campground) {
			req.flash("error", "No campground found");
			return res.redirect("back");
		} else{
			res.render("comments/new", {campground: campground});
		}
	});
});
router.post("/", middleware.isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err || !campground){
			req.flash("error", "No campground found");
			res.redirect("/campgrounds");
		} else {
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
				} else {
					//add username and id to commentt
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//save comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});


//edit
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground) {
			req.flash("error", "No campground found");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				req.flash("error", "Comment not found");
				res.redirect("back");
			} else {
				res.render("comments/edit",{campground_id: req.params.id, comment: foundComment });
			}
		})
	})
	
	
})
//comment update
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground) {
			req.flash("error", "No campground found");
			return res.redirect("back");
		}
		Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedCommnet){
			if(err){
				res.redirect("back");
			} else {
				res.redirect("/campgrounds/" + req.params.id);
			}
		})
	})
})

//comment destroy
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground) {
			req.flash("error", "No campground found");
			return res.redirect("back");
		}
		Comment.findByIdAndRemove(req.params.comment_id, function(err){
			if(err){
				res.redirect("back");
			} else {
				req.flash("success","Comment deleted!");
				res.redirect("back");
			}
		})
	})
})



module.exports = router;