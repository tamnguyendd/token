const express = require("express");
require("dotenv").config({ path: "./config.env" });
const app = express();
const http = require('http');
const cors = require("cors");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server,{
  cors:{
    origin: process.env.SOCKET_CLIENT,
    methods:["GET", "POST"]
  },
});

io.on('connection', (socket) => {
  console.log(socket.id);

  socket.on("join_room", async (room_id) => {
    //socket.join("tam_1ec8A7DE32fd487FBd73e008fFfe00D4f36f0650");
    room ="rid_"+room_id.substring(2);
    socket.join(room);
    console.log(room);

    // return all Socket instances in the "room1" room of the main namespace
    //const sockets = await  io.in(room_id).fetchSockets();
    //console.log(sockets.length);
  });

  socket.on("send_message", (data) => {
    //socket.to(data).emit("receive_message", data);
    socket.emit("receive_message", data);
    console.log(data);
  })

  socket.on("disconnect", () =>{
    console.log("User disconect" + socket.id);
  })
});


const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(require("./routes/record"));
app.use(require("./routes/token"));
app.use(require("./routes/game"));

// get driver connection
const dbo = require("./db/conn");

const Web3 = require('web3');
app.use("/scripts", express.static(__dirname + "/node_modules/web3.js-browser/build/"));
const MetamaskUtil = require('./metamask/metamask_utility');


server.listen(port, async () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);

  });
  console.log(`Server is running on port: ${port}`);

  await MetamaskUtil.Get_event_have_human_join();
  await MetamaskUtil.Get_event_nap_tien_log(io);
});