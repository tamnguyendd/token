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
    room = room_id.toLowerCase();
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
const chubaove = require('./commons/chubaove')


server.listen(port, async () => {
  // perform a database connection when server starts
  await dbo.connectToServer(async function (err) {
    if (err) console.error(err);

    //CHU BAO VE TUAN TRA
    setInterval(async() => {
      await chubaove.Get_game_do_NOT_deposit_YET();
    }, process.env.CHUBAOVE_TIME_INTERVAL);
    
  });

  console.log(`Server is running on port: ${port}`);

  await MetamaskUtil.Get_event_deposit_by_token_log(io, chubaove);
  await MetamaskUtil.Get_event_deposit_by_default_log(io, chubaove);

  
});