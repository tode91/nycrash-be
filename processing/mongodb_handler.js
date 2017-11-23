// Retrieve
var MongoClient = require('mongodb').MongoClient;

function connect_mongodb(host, db_name, collection_name){
	return MongoClient.connect("mongodb://"+host+"/"+db_name, function(err, db) {
		if(!err) {
			console.log("Database:\t"+db_name)
			return db
			get_collection(db, mongodb_collection_name);
		}else{
			console.log("unable to connect to "+ db)
			return null;
		}
	});
}


function get_collection(db, collection_name){
	return db.collection(collection_name, function(err, collection) {
		if(!err) {
			console.log("Collection:\t"+collection_name)
		    return collection.findOne({})
		  }else{
			console.log("unable to connect to "+ collection)
			return null
		  }
	});
	
}

var mongodb_host = "localhost:27017";
var mongodb_db_name = "nyc";
var mongodb_collection_name = "crash";
var db = connect_mongodb(mongodb_host, mongodb_db_name);
var crash_coll = get_collection(db, mongodb_collection_name)
	if(!!crash_coll){
		console.log(crash_coll.);
	}
}else{console.log("bu")}
