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
			CREATE TABLE IF NOT EXISTS "phones" (
			"id" INTEGER NOT NULL UNIQUE,
			"brand" TEXT NOT NULL,
			"model" TEXT NOT NULL,
			"os" TEXT NOT NULL,
			"image" TEXT NOT NULL,
			"screensize" INTEGER NOT NULL,
			PRIMARY KEY("id" AUTOINCREMENT)
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
// Server
// #############################################################################

// Creating our express api called api
var express = require("express");
var app = express();
var router = express.Router();

// Logs requests in terminal
var morgan = require("morgan");
app.use(morgan("dev"));

// We need some middleware to parse JSON data in the body of our HTTP requests:
var bodyParser = require("body-parser");
app.use(bodyParser.json());

// #############################################################################
// GET html Pages
// #############################################################################

app.use(express.static("web"));

// #############################################################################
// API
// #############################################################################

router.get("/test", function(req, res) {

	res.send("<h1> Server Test </h1>");
});

router.get("/phone", function(req, res) {

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
	});
});

router.get("/phones", function(req, res) {

	db.serialize(function() {

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
});

router.post('/post', function(req, res) {

	brand = req.body.brand;
	model = req.body.model;
	os = req.body.os;
	image = req.body.image;
	screensize = req.body.screensize;

	db.serialize(function() {

		sqlQuery = "INSERT INTO phones(brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)";
		data = [brand, model, os, image, screensize];

		db.run(sqlQuery, data, function(err) {
			if(err){
				console.error(err.message);
			} else {
				res.send({
					message : 'successful'
				});
			}
		});
	});
});

router.put('/update', function(req, res){

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

			res.send(phone) ;
		});
	});
});

router.delete('/delete', function(req, res){

	const id = req.query.id;

	db.serialize(function() {

		sqlQuery = "DELETE FROM phones WHERE id = ?";

		db.run(sqlQuery, [id], function(err){

			if(err){
				console.error(err.message);
			} else {
				res.send({
					message : 'successful'
				});
			}
		});
	});
});

router.get('/reset', function(req, res){

	db.serialize(function() {

		sqlQuery = "DELETE FROM phones";

		db.run(sqlQuery, function(err){

			if(err){
				console.error(err.message);
			} else {

				db.run(`INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)`,
				["Fairphone", "FP3", "Android", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fairphone_3_modules_on_display.jpg/320px-Fairphone_3_modules_on_display.jpg", "5.65"]);

				res.send({
					message : 'successful'
				});
			}
		});
	});
});

app.use('/hava', router);
app.listen(8080);
