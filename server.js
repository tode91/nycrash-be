/**
 * http://usejsdoc.org/
 */

var express = require('express');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var app = express();

var MongoClient = require('mongodb').MongoClient;
var db;
var crash_coll = "nyc_crash";

var server_host = "http://localhost";
var server_port = 8888

var MongoClient = mongodb.MongoClient;
var mongodb_db_name="nyc"
var mongodb_server= "mongodb://localhost:27017/"+mongodb_db_name

var mongodb_coll_name = "nyc_crash_from_2017";




app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Pass to next layer of middleware
    next();
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

function errorHandler(req, res, errorMessage) {
    res.statusMessage = errorMessage;
    res.status(400).send({"Error":errorMessage})
}

//PINGER SERVER
app.get("/pinger", function(req, res, next) {
	var response = {"server_api":{"Server Active": true, "host":server_host, "port":server_port, "complete_address":server_host+":"+server_port}}

	MongoClient.connect(mongodb_server, function(err, db) {
		  if(err) {
			  console.error(err);
			  errorHandler(req,res,"MongoDB connection error")
		  }
		  db.collection(mongodb_coll_name).count(function(err, count) {
				if (err) throw error;
		        response["db"] ={"type":"Mongodb","server":mongodb_server,"db_name":mongodb_db_name,"collection":mongodb_coll_name,"count":count}
		        res.send(response);
		  })
	});	
});


//EXAMPLE POST
//Reuse database object in request handlers
app.post("/", function(req, res, next) {
	console.log("request received");
	console.log(req.body)
	res.send(req.body)
});


//EXAMPLE QUERY WITH MONGODB CONNECTION


//post request 
//count crash by zip code
app.post("/crash_by_area", function(req, res, next) {
	MongoClient.connect(mongodb_server, function(err, db) {
		  if(err) {errorHandler(req,res,"MongoDB connection error")}		  
		  var area_type = req.body.area_type
		  var json_group;
		  var json_match;
		  switch(area_type){
			  case "zipcode":
				  json_match= {"zip_code":{ $exists: true }};
				  json_group= {"id":"$zip_code.id","name":"$zip_code.name","area":"$zip_code.area"}
				  break;
			  case "tract": 
				  json_match= {"tract":{ $exists: true }};
				  json_group= {"id":"$tract_code.id","name":"$tract_code.name","area":"$tract_code.area"}
				  break;
			  case "borough": 
				  json_match= {"borough":{ $exists: true }};
				  json_group= {"id":"$borough.id","name":"$borough.name","area":"$borough.area"}
				  break;
		  }
		  console.log(json_group)
		  db.collection(mongodb_coll_name).aggregate([
			  {$match:json_match},
			  {$group: {
		  		_id: json_group,
		  		person_injured: {$sum: "$NUMBER OF PERSONS INJURED"},
		  		person_killed: {$sum: "$NUMBER OF PERSONS KILLED"},
		  		pedestrian_injured: {$sum: "$NUMBER OF PEDESTRIANS INJURED"},
		  		pedestrian_killed: {$sum: "$NUMBER OF PEDESTRIANS KILLED"},
		  		cyclist_injured: {$sum: "$NUMBER OF CYCLISTS INJURED"},
		  		cyclist_killed: {$sum: "$NUMBER OF CYCLISTS KILLED"},
		  		motorist_injured: {$sum: "$NUMBER OF MOTORIST INJURED"},
		  		motorist_killed: {$sum: "$NUMBER OF MOTORIST KILLED"},
		  		crash: { $sum: 1 }
		  		}
			  }
		  ], function(err, result) {
			  if(err) {errorHandler(req,res,"MongoDB query error")}		  
		      res.send(result)
		      db.close();
		    });
	});	
});


//count crash by street
app.post("/crash_by_street", function(req, res, next) {
	MongoClient.connect(mongodb_server, function(err, db) {
		  if(err) {errorHandler(req,res,"MongoDB connection error")}
		  
		  db.collection(mongodb_coll_name).aggregate([
			  {$match:{"street_list_4":{ $exists: true }}},
			  {$unwind : "$street_list_4" },
			  {$group: {
				_id:{"id":"$street_list_4.id","name":"$street_list_4.name"},
		  		person_injured: {$sum: "$NUMBER OF PERSONS INJURED"},
		  		person_killed: {$sum: "$NUMBER OF PERSONS KILLED"},
		  		pedestrian_injured: {$sum: "$NUMBER OF PEDESTRIANS INJURED"},
		  		pedestrian_killed: {$sum: "$NUMBER OF PEDESTRIANS KILLED"},
		  		cyclist_injured: {$sum: "$NUMBER OF CYCLISTS INJURED"},
		  		cyclist_killed: {$sum: "$NUMBER OF CYCLISTS KILLED"},
		  		motorist_injured: {$sum: "$NUMBER OF MOTORIST INJURED"},
		  		motorist_killed: {$sum: "$NUMBER OF MOTORIST KILLED"},
		  		crash: { $sum: 1 }
		  		}
			  }
		  ], function(err, result) {
		      res.send(result)
		      db.close();
		    });
	});	
});


//count crash by street
app.post("/dashboardsParameters", function(req, res, next) {
	var kpis = ["person_injured","person_killed","pedestrian_injured","pedestrian_killed","cyclist_injured","cyclist_killed","motorist_injured","motorist_killed","crash"]
	var scales = ["logaritmic","sqrt","linear"].sort()
	var response = {}
	response["kpi_list"] = kpis.sort()
	response["scale_list"] = scales.sort()
	
	res.send(response)
});


//Starting the app here will work, but some users will get errors if the db connection process is slow.  
app.listen(server_port);
console.log("Listening on \t"+server_host+":"+server_port);