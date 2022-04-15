const { MongoClient, MongoErrorLabel } = require("mongodb");
const { resource } = require("../app");

// Connection URI
const uri =
    "mongodb://database-cp:Fpez9VBoAQnnZqSYxWLEFZHA5x5uNxbnzEa1KUkcCHnWexf4WrdpTF8MltUKV3CvLTqmQG1fARzJMHpqPbPYbA==@database-cp.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@database-cp@"
// Create a new MongoClient
const client = new MongoClient(uri);
const dbName = "textDB";

module.exports.addObject = function(myobj) {
    MongoClient.connect(uri, function (err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        dbo.collection("text").insertOne(myobj, function (err, res) {
            if (err) throw err;
            console.log('1 row inserted ! ');
            db.close();
        });
    });
} 

module.exports.findObject = function(myobj) {
    MongoClient.connect(uri, function (err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        dbo.collection("text").find(myobj).toArray(function(err, res) {
            if (err) throw err;
            console.log(res);
            db.close();
        })
    })
}

module.exports.deleteObject = function(myobj) {
    MongoClient.connect(uri, function (err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        dbo.collection("text").deleteOne(myobj, function (err, res) {
            if (err) throw err;
            console.log('1 row deleted');
            db.close();
        })
    })
}