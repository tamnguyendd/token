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
gameRouter.route("/game/deposit").post(async function (req, response) {
    let db_connect = dbo.getDb();
    let key = { 'wallet_address': req.body.fromAddress }
    let myobj = {
        wallet_address: req.body.fromAddress,
        enable: true,
        // amount: req.body.amount,
        insert_dt: new Date()
    };

    let datainsert = { $setOnInsert: myobj }

    // add wallet_address to collections
    //db_connect.collection("game_deposit").insertOne(myobj, function (err, res) {
    let doc = await db_connect.collection("game_deposit")
        .findOneAndUpdate(key, datainsert, { new: true, upsert: true, returnDocument: 'after' });

    // add deposit to history
    if (!doc.value.deposit_history) doc.value.deposit_history = [];

    let ntId = dbo.convertObjectIdToNumber(doc.value._id) + (doc.value.deposit_history.length + 1);
    doc.value.deposit_history.push({
        id: ntId,
        amount: req.body.amount,
        token_order: req.body.token_order,
        insert_dt: new Date()
    });

    await db_connect
        .collection("game_deposit")
        .updateOne({ _id: doc.value._id }, {
            $set: {
                deposit_history: doc.value.deposit_history
            },
        }, function (err, res) {
            if (err) throw err;
            console.log("1 document updated");
            //response.json(res);
        });

    response.json(ntId);
});

gameRouter.route("/game/deposit_history").post(async function (req, response) {
    let db_connect = dbo.getDb();

    let data = await db_connect.collection("game_deposit")
        .find({
            wallet_address: req.body.fromAddress,
            enable: true,
            deposit_history: {
                $exists: true,
                $ne: [],

                // $elemMatch: {
                //     deposit_done: { $exists: true, $eq: true }
                // }
            }
        },
            { "deposit_history.$": 1, name: 1 })
        .toArray();

    let tokens = await db_connect.collection("tokens")
        .find({ list_token_id: "list_tokens_erc20" })
        .toArray();//[0].list_tokens;

    let list_tokens = tokens[0].list_tokens;
    let hisData = [];

    if (data && data.length > 0 && data[0].deposit_history) {
        for (const [index, value] of data[0].deposit_history.entries()) {
            if (value.deposit_done && value.deposit_done === true) {
                if (value.token_order === -1) {
                    value.token_symbol = process.env.REACT_APP_BLOCKCHAIN_NET;
                } else {
                    value.token_symbol = list_tokens.find(e => e._index == value.token_order)?._Symbol;
                }

                if (value.deposit_token_order === -1) {
                    value.deposit_token_symbol = process.env.REACT_APP_BLOCKCHAIN_NET;
                } else {
                    value.deposit_token_symbol = list_tokens.find(e => e._index == value.deposit_token_order)?._Symbol;
                }

                hisData.push(value);
            }
        }
    }
    response.json(hisData);
});

module.exports = gameRouter;