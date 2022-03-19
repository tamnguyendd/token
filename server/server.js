const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(require("./routes/record"));
app.use(require("./routes/token"));
// get driver connection
const dbo = require("./db/conn");
 
const Web3 = require('web3');
app.use("/scripts",express.static(__dirname + "/node_modules/web3.js-browser/build/"));

// const MetamaskValue = require("./MetamaskValue");
// var Contract = require("web3-eth-contract");
// Contract.setProvider("wss://rinkeby.infura.io/ws/v3/c8a3bb3d19a54ee2be98588e53a5e4eb");
// const addressMM = MetamaskValue.SM_PAYMENT_ADDRESS;
// const ABI =MetamaskValue.SM_PAYMENT_ABI;
// var contractMM = new Contract(ABI, addressMM);

// const number_of_token = () =>{
//     contractMM.methods.number_of_token().call().then((data) => {
//         console.log("number_of_token: " + data);
//     });
// }

app.listen(port, () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
 
  });
  console.log(`Server is running on port: ${port}`);

 //number_of_token();
});