import { io } from "socket.io-client";
const ENDPOINT = process.env.REACT_APP_API_URL;

console.log(ENDPOINT);
var socket = io.connect(ENDPOINT);
socket.on("connect", () => {
    console.log(socket.id); // "G5p5..."
});

socket.on("receive_message", (data) => {
    console.log(data);
});

export const sk = {
    socket : socket,

    Get_socket_id: function(){
        return socket.id;
    },

    Get_socket_obj: function(){
        return socket;
    },

    Join_Room_Socket: async function (room_id){
        console.log(room_id);
        await socket.emit("join_room", room_id);
    },
}