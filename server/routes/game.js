const express = require("express");

// gameRouter is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const gameRouter = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

// connect metamask and smart contract
const MetamaskValue = require("../metamask/MetamaskValue");

// This section will help you get a list of all the records.
gameRouter.route("/game").get(function (req, res) {
    res.json("Hello game");
});

// This section will help you create a new record.
gameRouter.route("/game/naptien").post(function (req, response) {
    let db_connect = dbo.getDb();
    let myobj = {
        fromAddress: req.body.fromAddress,
        amount: req.body.amount,
    };
    db_connect.collection("game").insertOne(myobj, function (err, res) {
        if (err) throw err;
        //console.log(res);
    });
    response.json(dbo.convertObjectIdToNumber(myobj._id));
});

module.exports = gameRouter;