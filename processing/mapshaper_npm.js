/**
 * http://usejsdoc.org/
 */

var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;
var mongodb_db_name="nyc"
var mongodb_server= "mongodb://localhost:27017/"+mongodb_db_name

var geo_coll = "nyc_geojson_street";

MongoClient.connect(mongodb_server, function(err, db) {
	  if(err) {
		  console.error(err);
		  errorHandler(req,res,"MongoDB connection error")
	  }
	  db.collection(geo_coll).distinct("properties.name",function(err, names) {
	        //console.log(docs)
	        console.log(names)
	        names = names.slice(0,1)
	        console.log(names)
	        
	        names.map(function(name, index) {
	        		console.log(name, index)
	        		db.collection(geo_coll).aggregate(
	        				{$project:{"geometry.coordinates":1}},
	        				{$match:{"properties.name":name}}
	        			).toArray(function(err, docs) {
	        				console.log(docs[1].geometry.coordinates)
	        		});
	        });
	        
	        
	  })
});	

