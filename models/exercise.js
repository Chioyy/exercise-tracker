// Create models for MongoDB database
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
	_id: Number,
	userId: Number, 
	description: String,
	duration: Number,
	date: String
}, {timestamps: true});

const exerciseClass = mongoose.model("exercise", exerciseSchema);

module.exports = exerciseClass;