var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware/index.js");
var NodeGeocoder = require('node-geocoder');

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dcwk1vhgg', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

router.get("/new", middleware.isLoggedIn, function(req, res) {
	res.render("campgrounds/new");
})
router.get("/", function(req,res){
	var noMatch;
	if(req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name: regex}, function(err, allcampgrounds) {
			if(err) {
				console.log(err);
			} else{
				
				if(allcampgrounds.length < 1) {
					noMatch = "No Campground match the search, please try again!";
				} 
				res.render("campgrounds/index",{campgrounds: allcampgrounds,  noMatch:noMatch});
				
				
			}
		})
		
	} else {
		//get all campgrounds from DB
		Campground.find({}, function(err, allcampgrounds) {
			if(err) {
				console.log(err);
			} else{
				res.render("campgrounds/index",{campgrounds: allcampgrounds, noMatch:noMatch});
			}
		})
	}
	//console.log(res);
	
});

// router.post("/", middleware.isLoggedIn,function(req, res){
// 	//res.send("You hit the post route");
// 	var name = req.body.name;
// 	var price = req.body.price;
// 	var image = req.body.image;
// 	var desc = req.body.description;
// 	var author = {
// 		id: req.user._id,
// 		username: req.user.username
// 	}
// 	var newCampground = {name: name, price: price, image: image, description: desc, author: author};
// 	// campgrounds.push(newCampgound);
// 	//create a new campground and save to DB
// 	Campground.create(newCampground, function(err, newlyCreated){
// 		if(err){
// 			console.log(err);
// 		}else{
// 			console.log(newlyCreated);
// 			res.redirect("/campgrounds");
// 		}
// 	})
// });


//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single("image"), function(req, res){
  // get data from form and add to campgrounds array
	
  // var name = req.body.name;
  // var image = req.body.image;
  // var desc = req.body.description;
  // var author = {
  //     id: req.user._id,
  //     username: req.user.username
  // }
	
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
	  
    // var lat = data[0].latitude;
    // var lng = data[0].longitude;
    // var location = data[0].formattedAddress;
    // var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
	  
	req.body.campground.lat = data[0].latitude;
	req.body.campground.lng = data[0].longitude;
	req.body.campground.location = data[0].formattedAddress;
	  
    // Create a new campground and save to DB
	  
	  cloudinary.uploader.upload(req.file.path, function(result) {
		  // add cloudinary url for the image to the campground object under image property
		  req.body.campground.image = result.secure_url;
		  req.body.campground.imageId = result.public_id;
		  // add author to campground
		  req.body.campground.author = {
			id: req.user._id,
			username: req.user.username
		  }
		  Campground.create(req.body.campground, function(err, campground) {
			if (err) {
			  req.flash('error', err.message);
			  return res.redirect('back');
			}
			res.redirect('/campgrounds/' + campground.id);
		  });
		});
	  
    // Campground.create(newCampground, function(err, newlyCreated){
    //     if(err){
    //         console.log(err);
    //     } else {
    //         //redirect back to campgrounds page
    //         //console.log(newlyCreated);
    //         res.redirect("/campgrounds");
    //     }
    // });
  });
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


//old edit update with image url
// router.put("/:id",middleware.checkCampgroundOwnership, function(req, res) {
// 	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
// 		if(err){
// 			res.redirect("/campgrounds");
// 		} else {
// 			res.redirect("/campgrounds/" + req.params.id);
// 		}
// 	})
// });

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, upload.single("image"), function(req, res){
	Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
			if (req.file) {
                try {
                    await cloudinary.uploader.destroy(campground.imageId);
                    var result = await cloudinary.uploader.upload(req.file.path);
                    campground.imageId = result.public_id;
                    campground.image = result.secure_url;
                } catch(err) {
					console.log("err1");
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
					
			geocoder.geocode(req.body.location, function (err, data) {
				if (err || !data.length) {
				  req.flash('error', 'Invalid address');
				  return res.redirect('back');
				}

				campground.lat = data[0].latitude;
				campground.lng = data[0].longitude;
				campground.location = data[0].formattedAddress;
			});
			campground.name = req.body.campground.name;
            campground.description = req.body.campground.description;
			campground.price = req.body.campground.price;
            campground.save();

			req.flash("success","Successfully Updated!");
			res.redirect("/campgrounds/" + campground._id); 
		}
	
	});
});

//destroy campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	if(req.isAuthenticated()){
	// 	Campground.findByIdAndRemove(req.params.id, function(err){
	// 	if(err){
	// 		res.redirect("/campgrounds");
	// 	} else {
	// 		res.redirect("/campgrounds");
	// 	}
	// })
		Campground.findById(req.params.id, async function(err, campground) {
			if(err) {
			  req.flash("error", err.message);
			  return res.redirect("back");
			}
			try {
				await cloudinary.v2.uploader.destroy(campground.imageId);
				campground.remove();
				req.flash('success', 'Campground deleted successfully!');
				res.redirect('/campgrounds');
			} catch(err) {
				if(err) {
				  req.flash("error", err.message);
				  return res.redirect("back");
				}
			}
		});
	}	
})


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;