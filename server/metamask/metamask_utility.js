const MetamaskValue = require('./MetamaskValue');

var Contract = require("web3-eth-contract");
Contract.setProvider(process.env.SOCKET_INFURA);
const addressMM = MetamaskValue.SM_PAYMENT_ADDRESS;
const ABI = MetamaskValue.SM_PAYMENT_ABI;
var contractMM = new Contract(ABI, addressMM);

const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider(process.env.SOCKET_INFURA);
const web3 = new Web3(provider);

module.exports = {
    Get_number_of_token: async function () {
        return await contractMM.methods.number_of_token().call();
    },

    Get_event_have_human_join: async function () {

        await contractMM.events.have_human_join(
            {
                filter: {},
                fromBlock: "latest"
                //fromBlock: 0,
                //toBlock: "latest"
            }, function (err, events) {
                if (!err) {
                    console.log("******event_have_human_join OK *******");
                    //console.log(events);
                    if (events) {
                        console.log(events.returnValues.payment_id);
                        console.log(events.returnValues.token_order);
                        console.log(events.returnValues.amount);
                        console.log(web3.utils.fromWei(events.returnValues.amount, "ether"))
                    }
                } else {
                    console.log("ERROR");
                }
            });

        // await contractMM.getPastEvents(
        //     "have_human_join",
        //     {
        //         //filter: { order_id: [2] },
        //         //filter: {value: [117,50]},
        //         //filter: {payment_id:["16480401241271143642922538634"]}, 
        //         //fromBlock: "latest" ,
        //         //fromBlock: 0 ,
        //         //toBlock: "latest"
        //         filter: {},
        //         fromBlock: "latest"
        //     }, (errors, events) => {
        //         if (!errors) {
        //             if (events.length > 0) {
        //                 console.log(events[0].returnValues.payment_id);
        //                 console.log(events[0].returnValues.token_order);
        //                 console.log(events[0].returnValues.amount);
        //                 console.log(web3.utils.fromWei(events[0].returnValues.amount, "ether"))
        //             }
        //             console.log("OK");
        //         }
        //     }
        // );

    },

    Get_event_nap_tien_log: async function (socket_io) {
        await contractMM.events.nap_tien_log(
            {
                filter: {},
                fromBlock: "latest"
                //fromBlock: 0,
                //toBlock: "latest"
            }, function (err, events) {
                if (!err) {
                    console.log("******event nap_tien_log");
                    //console.log(events);
                    if (events) {
                        console.log(events.returnValues.sender);
                        console.log(events.returnValues._id);
                        console.log(web3.utils.fromWei(events.returnValues.amount, "ether"))

                        socket_io.to("rid_"+events.returnValues.sender.substring(2)).emit("receive_message", "hello from event nap_tien_log");
                        //socket_io.emit("receive_message", "hello from event nap_tien_log");
                        //socket_io.to("tam_1ec8A7DE32fd487FBd73e008fFfe00D4f36f0650").emit("receive_message", "hello from event nap_tien_log");
                    }
                } else {
                    console.log("ERROR");
                }
            });
    },

    getContractMM: function () {
        return contractMM;
    },
};
