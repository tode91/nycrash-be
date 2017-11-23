/**
 * http://usejsdoc.org/
 */
var stringSimilarity = require('string-similarity');
var matches = stringSimilarity.findBestMatch('healed', ["healed ghgfgtr","h","hea",'edward', 'sealed', 'theatre']);

var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;
var mongodb_db_name="nyc"
var mongodb_server= "mongodb://localhost:27017/"+mongodb_db_name

var street_coll = "nyc_streets_groupedby_name";
var crash_coll = "nyc_crash";
var match_street= "nyc_match_streets";

MongoClient.connect(mongodb_server, function(err, db) {
	  if(err) {
		  console.error(err);
		  errorHandler(req,res,"MongoDB connection error")
	  }
	  db.collection(street_coll).find().toArray(function(err, docs) {
	        //console.log(docs)
	        var list_street = []
	        var list_index =[]
	        for(var i =0 ; i<docs.length;i++ ){
	        		list_street.push(docs[i]["_id"]+"")
	        		list_index.push(docs[i]["list_id"])
	        }
	        /*db.collection(crash_coll).find({}).toArray(function(err, crashes) {
	        		if(err) {
	      		  console.error(err);
	      		  errorHandler(req,res,"MongoDB connection error")
	        		}
	        		var batch =db.collection(crash_coll).initializeUnorderedBulkOp({useLegacyOps:true});
	        		for(var j = 0; j<crashes.length; j++){
	        			console.log(crashes.length-j)
	        			var crash = crashes[j];
	        			var id_street_on = getListStreetId(crash, "ON STREET NAME", list_street, list_index)
	        			var id_street_off = getListStreetId(crash, "OFF STREET NAME", list_street, list_index)
	        			var id_street_cross = getListStreetId(crash, "CROSS STREET NAME", list_street, list_index)
	        			var final_list_to_add = id_street_on.concat(id_street_off.concat(id_street_cross))
	        			batch.find(crash).updateOne({$set:{"street_list":final_list_to_add}});
	        		}
	        		
	        		batch.execute(function(err,result){
	        			if(err) {
	        				console.error(err);
	        				errorHandler(req,res,"MongoDB connection error")
      	        		}
	        			console.log("Modified",result.nModified)
	        			
	        		})
	        })*/
	        
	        
	        
	     /*   db.collection(crash_coll).distinct("CROSS STREET NAME",function(err, streets) {
		    		if(err) {
		  		  console.error(err);
		  		  errorHandler(req,res,"MongoDB connection error")
		    		}
		    		for(var j = 0; j<streets.length; j++){
	        			console.log("CROSS STREET NAME" ,streets.length-j)
	        			var street = streets[j];
	        			var id_street_on = getListStreetId(street, "CROSS STREET NAME", list_street, list_index)
	        			db.collection(crash_coll).
	        				updateMany(
	        						{"CROSS STREET NAME":street},
	        						{$addToSet:{"street_list":{$each:id_street_on}}}
	        				);
	        		}
	        })
	        
	     */   
	        db.collection(crash_coll).distinct("ON STREET NAME",function(err, on_streets) {
	        		if(err) {
	        		  console.error(err);
	        		  errorHandler(req,res,"MongoDB connection error")
	        		}
	        		db.collection(crash_coll).distinct("OFF STREET NAME",function(err, off_streets) {
		        		if(err) {
		        		  console.error(err);
		        		  errorHandler(req,res,"MongoDB connection error")
		        		}
		        		db.collection(crash_coll).distinct("CROSS STREET NAME",function(err, cross_streets) {
			        		if(err) {
			        		  console.error(err);
			        		  errorHandler(req,res,"MongoDB connection error")
			        		}
			        	
			        		var merged_street_list = on_streets.concat(off_streets.concat(cross_streets)).sort()
			        		
			        		//merged_street_list= merged_street_list.slice(0,1000);
			        		
			        		var count_street= merged_street_list.length;
			        	    
			        	    var final = merged_street_list.map(function(i, elem) {return getListStreetId(i, list_street, list_index)})
			        	    console.log(final.length)
			        	    db.collection(match_street).insertMany(final,function(err, r) {
				        	    		if(err) {
				      		  		  console.error(err);
				      		  		  errorHandler(req,res,"MongoDB connection error")
				      		    		}
				        	    		console.log("DONE")
					        	    db.close()
				        	    })
				        	    
			        	    console.log(final.length)
			        		
		        		})
		        })
	        })
	        
	  })
});	

function getListStreetId(crash, list_street, list_index){
	var on_sim = stringSimilarity.findBestMatch(crash+"",list_street)["bestMatch"]
	var index_to_add = list_index[list_street.indexOf(on_sim["target"])]
	if (crash== null) crash=""
	if(index_to_add == null){
		return {"street":crash,"geo_ids":[]}
	}else{
		return {"street":crash,"geo_ids":index_to_add}
	}
	 
}

