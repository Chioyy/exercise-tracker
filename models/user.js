// Create models for MongoDB database
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	userName: String,
	_id: Number
}, {timestamps: true});

const userClass = mongoose.model("user", userSchema);

module.exports = userClass;
