// Exercise tracker
// Setup
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userModel = require("./models/user");
const exerciseModel = require("./models/exercise");
const app = module.exports = express();
app.use(cors());
app.use(bodyParser.json());
mongoose.connect("mongodb+srv://Urlman:Urlman@cluster0-4cqwg.mongodb.net/test?retryWrites=true", {useNewUrlParser: true}, (err, db) => { 
	if (err) console.log("Error connecting to MongoDB", err); 
	console.log("Connected to MongoDB"); 
});

// Get username from client => send id back
app.get("/user/:username", function(req, res, next) {
	// Variables
	let userName = req.params.username;
	// Test if userName is already in database
	userModel.findOne({userName: userName}, (err, data) => {
		if (err) { 
			return (err);
		}
		if (data != null && data.userName == userName) {
			res.json({userName: userName, ID: data.id});
		}
		else {
			// Create new id
			let newId = Math.floor(Math.random() * 100000).toString();
			// Add address in database 
			let newUser = new userModel({
				userName: userName,
				_id: newId                                                                                                               
			});  
			newUser.save((err) => {
				if (err) {
					newId = "error, saving to database failed";
				}
			});
			res.json({userName: userName, ID: newId});
		}
	});	
});

// Get username from client => send back array of all users id
app.get("/users/:username", function(req, res, next) {
	// Variables
	let userName = req.params.username;
	// Test if userName is in database
	userModel.findOne({userName: userName}, (err, data) => {
		if (err) { 
			return (err);
		}
		if (data != null && data.userName == userName) {
			let usersArray = [];
			userModel.find({}, (err, userData) => {
				if (err) { 
					return (err);
				}
				usersArray = userData;
				res.json([usersArray]);
			});
		}
		else {
			res.json({Error: "invalid username"});
		}
	});	
});

// Get id, description, duration and date from client => send saved info back
app.get("/add/:exercise", function(req, res, next) {
	// Variables
	let exercise = req.params.exercise.split(",");
	exercise[0] = Number(exercise[0]);
	exercise[2] = Number(exercise[2]);
	// Test if exercise has all required data
	if (isNaN(exercise[0]) === true || typeof exercise[1] != "string" || isNaN(exercise[2]) === true) {
		res.json({Error: "ID or duration isn't a number or description isn't a text"});	
	}
	else {
		// Test if ID is already in database
		userModel.findOne({_id: exercise[0]}, (err, data) => {
			if (err) { 
				return (err);
			}
			if (data == null || data._id != exercise[0]) {
				res.json({Error: "Invalid ID"});
			}
			else {
				// if date wasn't entered, set date to input time in YYYY-MM-DD format
				if (exercise[3] === "") {
					exercise[3] = formatDate(Date());
				}	
				// Check if date format is right
				const regex = /^\d{4}-\d{2}-\d{2}$/giu;
				if (regex.test(exercise[3]) === false) {
					res.json({Error: "Invalid date format"});
				}
				// Add exercise in database 
				else {
					let exerciseId = Math.floor(Math.random() * 1000000).toString();
					let newExercise = new exerciseModel({
						_id: exerciseId,
						userId: exercise[0],
						description: exercise[1],
						duration: exercise[2],
						date: exercise[3]                                                                                                             
					});
					newExercise.save((err) => {
						if (err) {
							return err;
						}
					});
					res.json({
						Username: data.userName,
						ID: data._id,
						UserID: exercise[0],
						description: exercise[1],
						duration: exercise[2],
						date: exercise[3]
					});
				}
			}
		});
	}
});

// Get _id (and optionally date with from to and limit) from client => send back user object with array log and total exercise count
app.get("/log/:log", function(req, res, next) {
	// Variables
	let log = req.params.log.split(",");
	let id = Number(log[0]);
	let dateStart = log[1];
	let dateEnd = log[2];
	let limit = parseInt(log[3]);
	const regex = /^\d{4}-\d{2}-\d{2}$/iu;
	// Set up empty variables
	if (dateStart === "") {
		dateStart = "1971-01-01";
	}	
	if (dateEnd === "") {
		dateEnd = formatDate(Date());
	}	
	if (isNaN(limit) == true) {
		limit = 1000;
	}
	// Test if all data is in correct format
	if (isNaN(id) === true || Number.isInteger(limit) === false || regex.test(dateStart) === false || regex.test(dateEnd) === false) {
		res.json({Error: "invalid ID, date or limit"});
	}	
	else {	
		// Test if id is in database
		userModel.findOne({_id: id}, (err, userData) => {
			if (err) { 
				return (err);
			}
			if (userData != null && userData._id == id) {
				let user = userData.userName;
				exerciseModel.find({userId: id, date: {"$gte": dateStart, "$lt": dateEnd}}).sort({date: -1}).limit(limit).exec((err, data) => {
					if (err) {
						return err;
					}
					res.json({Username: user, ID: id, Exericises: data.length, data});
				});
			}	
			else {
				res.json({Error: "invalid ID"});
			}
		});
	}			
});

function formatDate(date) {
	let d = new Date(date),
		month = "" + (d.getMonth() + 1),
		day = "" + d.getDate(),
		year = d.getFullYear();
	if (month.length < 2) month = "0" + month;
	if (day.length < 2) day = "0" + day;
	return [year, month, day].join("-");
}

// Server listen
const listener = app.listen(process.env.PORT || 3000, function() {
	console.log("Listening port " + listener.address().port);
});