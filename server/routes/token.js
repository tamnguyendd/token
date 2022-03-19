const express = require("express");

// tokenRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const tokenRoutes = express.Router();

// connect metamask and smart contract
const MetamaskValue = require("../MetamaskValue");

var Contract = require("web3-eth-contract");
Contract.setProvider("wss://rinkeby.infura.io/ws/v3/c8a3bb3d19a54ee2be98588e53a5e4eb");
const addressMM = MetamaskValue.SM_PAYMENT_ADDRESS;
const ABI =MetamaskValue.SM_PAYMENT_ABI;
var contractMM = new Contract(ABI, addressMM);


const number_of_token = () =>{
    contractMM.methods.number_of_token().call().then((data) => {
        console.log("number_of_token: " + data);
    });
}

// This section will help you get a list of all the records.
tokenRoutes.route("/token").get(function (req, res) {
    number_of_token();
    res.json("Hello result");
});

module.exports = tokenRoutes;