const { MongoClient } = require("mongodb");
const Db = process.env.ATLAS_URI;
const client = new MongoClient(Db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

var _db;

module.exports = {
    connectToServer: async function (callback) {
        await client.connect(function (err, db) {
            // Verify we got a good "db" object
            if (db) {
                _db = db.db("S_Coin");
                console.log("Successfully connected to MongoDB.");
            }
            return callback(err);
        });
    },

    getDb: function () {
        return _db;
    },

    convertObjectIdToNumber: function (objectID) {
        var id = objectID.toString();
        ctr = 0;
        var timestamp = id.slice(ctr, (ctr += 8));
        var machineID = id.slice(ctr, (ctr += 6));
        var processID = id.slice(ctr, (ctr += 4));
        var counter = id.slice(ctr, (ctr += 6));

        var number = `${parseInt(timestamp, 16)+""+parseInt(machineID, 16)+parseInt(processID, 16)+parseInt(counter, 16)}`;
        //console.log("number: "+ number);
        return number;
    },

};