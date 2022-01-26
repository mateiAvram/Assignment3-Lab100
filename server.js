// Database Parameters and connection
const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('./phones.db', sqlite.OPEN_READWRITE, (err) => {

	if(err) {
		return console.error(err.message);
	}

	console.log("Connected to provided database");
	console.log("Server Test: http://localhost:8080/test");
});

// Creating our express api called api
var express = require("express");
var app = express();

// Logs requests in terminal
var morgan = require("morgan");
app.use(morgan("dev"));

// We need some middleware to parse JSON data in the body of our HTTP requests:
var bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/test", function(req, res) {

	res.send("<h1> Server Test </h1>") ;
});

app.get("/phone", function(req, res) {

	const id = req.query.id;

	// Fetch specified element from database than pass it to response
	sqlQuery = "SELECT * FROM phones WHERE id=" + id;

	db.get(sqlQuery, function(err, row) {

		if(err) {
			return console.error(err.message);
		}

		phone = {
			id: id,
			brand: row.brand,
			model: row.model,
			os: row.os,
			image: row.image,
			screensize: row.screensize
		}

		res.json(phone) ;
	});
});

app.get("/phones", function(req, res) {


	// Fetch all phones from database than pass it to response as an array
	sqlQuery = "SELECT * FROM phones";

	db.all(sqlQuery, function(err, rows) {

		if(err) {
			return console.error(err.message);
		}

		phones = [];
		rows.forEach((row) => {
			phones.push({id: row.id, brand: row.brand, model: row.model, os: row.os, image: row.image, screensize: row.screensize});
		});

		res.send(phones);
	});
});

app.post('/post-example', function(req, res) {
	// This is just to check if there is any data posted in the body of the HTTP request:
	console.log(req.body);
	return res.json(req.body);
});

app.listen(8080);
