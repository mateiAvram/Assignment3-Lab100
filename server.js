// Database Parameters and connection
const sqlite = require('sqlite3').verbose();
let db = my_database("./phones.db");

function my_database(filename) {
	// Conncect to db by opening filename, create filename if it does not exist:
	var db = new sqlite.Database(filename, (err) => {
  		if (err) {
			console.error(err.message);
  		}
  		console.log('Connected to provided database.');
	});
	// Create our phones table if it does not exist already:
	db.serialize(() => {
		db.run(`
        	CREATE TABLE IF NOT EXISTS phones
        	(id 	INTEGER PRIMARY KEY,
        	brand	CHAR(100) NOT NULL,
        	model 	CHAR(100) NOT NULL,
        	os 	CHAR(10) NOT NULL,
        	image 	CHAR(254) NOT NULL,
        	screensize INTEGER NOT NULL
        	)`);
		db.all(`select count(*) as count from phones`, function(err, result) {
			if (result[0].count == 0) {
				db.run(`INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)`,
				["Fairphone", "FP3", "Android", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fairphone_3_modules_on_display.jpg/320px-Fairphone_3_modules_on_display.jpg", "5.65"]);
				console.log("1 item inserted into database");
			}
		});
	});
	return db;
}

// #############################################################################
// API
// #############################################################################

// Creating our express api called api
var express = require("express");
var app = express();

// Logs requests in terminal
var morgan = require("morgan");
app.use(morgan("dev"));

// We need some middleware to parse JSON data in the body of our HTTP requests:
var bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/req.html");
});

app.get("/test", function(req, res) {

	res.send("<h1> Server Test </h1>") ;
});

app.get("/phone", function(req, res) {

	const id = req.query.id;

	// Fetch specified element from database than pass it to response
	sqlQuery = "SELECT * FROM phones WHERE id=" + id;

	db.serialize(function() {
		db.get(sqlQuery, function(err, row) {

			if(err) {
				console.error(err.message);
			}

			phone = {
				id: id,
				brand: row.brand,
				model: row.model,
				os: row.os,
				image: row.image,
				screensize: row.screensize
			}

			res.send(phone);
		});
	})

});

app.get("/phones", function(req, res) {

	// Fetch all phones from database than pass it to response as an array
	sqlQuery = "SELECT * FROM phones";

	db.all(sqlQuery, function(err, rows) {

		if(err) {
			console.error(err.message);
		}

		phones = [];
		rows.forEach((row) => {
			phones.push({id: row.id, brand: row.brand, model: row.model, os: row.os, image: row.image, screensize: row.screensize});
		});

		res.send(phones);
	});
});

// ############### TODO

// app.post('/postPhone', function(req, res) {
//
// 	brand = req.body.brand;
// 	model = req.body.model;
// 	os = req.body.os;
// 	image = req.body.image;
// 	screensize = req.body.screensize;
//
// 	sqlQuery = "INSERT INTO"
//
// });



app.put('/update', function(req, res){

	id = req.body.id;
	brand = req.body.brand;
	model = req.body.model;
	os = req.body.os;
	image = req.body.image;
	screensize = req.body.screensize;

	db.serialize(function() {

		sqlQuery = "UPDATE phones SET brand = ?, model = ?, os = ?, image = ?, screensize = ? WHERE id = ?";
		data = [brand, model, os, image, screensize, id];

		db.run(sqlQuery, data, function(err){
			if(err){
				console.error(err.message);
			}
		});

		sqlQuery = "SELECT * FROM phones WHERE id=" + id;

		db.get(sqlQuery, function(err, row) {

			if(err){
				console.error(err.message);
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
});

// ############### TODO
app.delete('/delete', function(req, res){

	const id = req.query.id;

	db.serialize(function() {

		sqlQuery = "DELETE FROM phones WHERE id = ?";

		db.run(sqlQuery, [id], function(err){

			if(err){
				console.error(err.message);
			}

			console.log("succesfully deleted");
			// Linia de sub pur si simplu nu merge ....
			res.send('success');
		});
	});
});

app.listen(8080);
