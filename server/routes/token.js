const express = require("express");

// tokenRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const tokenRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

// connect metamask and smart contract
const MetamaskValue = require("../metamask/MetamaskValue");

tokenRoutes.route("/token/sync_list_to_db").post(async function (req, response) {
    let db_connect = dbo.getDb();

    let key = { 'list_token_id': "list_tokens_erc20" }
    let myobj = {
        list_tokens: req.body.list_tokens
    };

    let datainsert = { $setOnInsert: myobj }

    let doc = await db_connect.collection("tokens")
        .findOneAndUpdate(key, datainsert, { new: true, upsert: true, returnDocument: 'after' });

    await db_connect
        .collection("tokens")
        .updateOne({ _id: doc.value._id }, {
            $set: {
                list_tokens: req.body.list_tokens
            },
        }, function (err, res) {
            if (err) throw err;
            console.log("1 document updated");
            //response.json(res);
        });

    response.json("Sync Ok!");
});

tokenRoutes.route("/token/get_list").post(async function (req, res) {
    let db_connect = dbo.getDb();
    let data = await db_connect
        .collection("tokens")
        .find({})
        .toArray();
    res.json(data);
});

tokenRoutes.route("/token/save_token_point_ratio").post(async function (req, response) {
    let db_connect = dbo.getDb();

    let key = {}
    let myobj = {
        insert_dt: new Date(),
        list_tokens: req.body.list_tokens
    };

    let datainsert = { $setOnInsert: myobj }

    let doc = await db_connect.collection("tokens_points")
        .findOneAndUpdate(key, datainsert, { new: true, upsert: true, returnDocument: 'after' });

    await db_connect
        .collection("tokens_points")
        .updateOne({ _id: doc.value._id }, {
            $set: {
                update_dt: new Date(),
                list_tokens: req.body.list_tokens
            },
        }, function (err, res) {
            if (err) throw err;
            console.log("1 document updated");
            //response.json(res);
        });

    response.json("Save Ok!");
});

tokenRoutes.route("/token/get_list_tokens_points").post(async function (req, res) {
    let db_connect = dbo.getDb();
    let data = await db_connect
        .collection("tokens_points")
        .find({})
        .toArray();
    res.json(data[0].list_tokens);
});


module.exports = tokenRoutes;