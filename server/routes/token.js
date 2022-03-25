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

// This section will help you get a list of all the records.
tokenRoutes.route("/token").get(function (req, res) {
    res.json("Hello result");
});

// This section will help you create a new record.
tokenRoutes.route("/token/add").post(function (req, response) {
    let db_connect = dbo.getDb();
    let myobj = {
        fromAddress: req.body.fromAddress,
        toAddress: req.body.toAddress,
        amount: req.body.amount,
    };
    db_connect.collection("tokens").insertOne(myobj, function (err, res) {
        if (err) throw err;
        //console.log(res);
    });
    response.json(dbo.convertObjectIdToNumber(myobj._id));
});

module.exports = tokenRoutes;