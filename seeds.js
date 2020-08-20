var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");

var data=[
	{name: "Clouds' Rest", 
	 image:"https://pixabay.com/get/55e8dc404f5aab14f1dc84609620367d1c3ed9e04e507440712872d1934ac4_340.jpg",
	description:"fasdfajlasfdajslkfdalweirowefjalsdkjflaskjdfoawieraoefjalksdjfalieuraoweijfalsdkfjalskfjoaieruaosfjalskdfjalskfjalskfjalsdkfajlsdkfjaowieraolskjfasdfkjalsfiwaoei"},
	{name: "Joshua Tree", 
	 image:"https://images.pexels.com/photos/1539225/pexels-photo-1539225.jpeg?auto=compress&cs=tinysrgb&h=350",
	description:"fasdfajlasfdajslkfdalweirowefjalsdkjflaskjdfoawieraoefjalksdjfalieuraoweijfalsdkfjalskfjoaieruaosfjalskdfjalskfjalskfjalsdkfajlsdkfjaowieraolskjfasdfkjalsfiwaoei"},
	{name: "Mountain", 
	 image:"https://pixabay.com/get/53e2dc4b4d54a514f1dc84609620367d1c3ed9e04e507440712872d1934ac4_340.jpg",
	description:"fasdfajl"}
]

function seedDB() {
	Campground.remove({}, function(err){
		if(err) {
			console.log(err);
		}
		console.log("removed campgrounds!");
		// data.forEach(function(seed){
		// 	Campground.create(seed, function(err, campground){
		// 		if(err){
		// 			console.log(err);
		// 		}
		// 		else {
		// 			console.log("added");
		// 			Comment.create({
		// 				text:"This place is great, but I wish there was internet",
		// 				author:"Homer"
		// 			},function(err, comment){
		// 				if(err){
		// 					console.log(err);
		// 				} else{

		// 					campground.comments.push(comment);
		// 					campground.save();
		// 					console.log("created new common");
		// 				}

		// 			})
		// 		}

		// 	})
		// })
	})
	User.remove({}, function(err){
		if(err) {
			console.log(err);
		}
		console.log("removed users!");
		// data.forEach(function(seed){
		// 	Campground.create(seed, function(err, campground){
		// 		if(err){
		// 			console.log(err);
		// 		}
		// 		else {
		// 			console.log("added");
		// 			Comment.create({
		// 				text:"This place is great, but I wish there was internet",
		// 				author:"Homer"
		// 			},function(err, comment){
		// 				if(err){
		// 					console.log(err);
		// 				} else{

		// 					campground.comments.push(comment);
		// 					campground.save();
		// 					console.log("created new common");
		// 				}

		// 			})
		// 		}

		// 	})
		// })
	})
	
}

module.exports = seedDB;

