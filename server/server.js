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

const MetamaskUtil = require('./metamask/metamask_utility');

app.listen(port, async () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
 
  });
  console.log(`Server is running on port: ${port}`);

  await MetamaskUtil.Get_event_have_human_join();
});