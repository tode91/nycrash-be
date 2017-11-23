var express = require('express');
var mongodb = require('mongodb');
var app = express();

var MongoClient = require('mongodb').MongoClient;
var db;
var crash_coll = "nyc_crash";


// Initialize connection once
MongoClient.connect("mongodb://localhost:27017/nyc", function(err, database) {
  if(err) return console.error(err);
  db = database;
});

// Reuse database object in request handlers
app.get("/", function(req, res, next) {
	console.log("here");
	var result = db.listCollections().toArray();
	console.log(result)
	res.end();
});

app.use(function(err, req, res){
   // handle error here.  For example, logging and returning a friendly error page
});

// Starting the app here will work, but some users will get errors if the db connection process is slow.  
  app.listen(3000);
  console.log("Listening on port 3000");