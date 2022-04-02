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

    Get_event_deposit_by_token_log: async function (socket_io, chubaove) {

        await contractMM.events.deposit_by_token_log(
            {
                filter: {},
                fromBlock: "latest"
                //fromBlock: 0,
                //toBlock: "latest"
            }, function (err, events) {
                if (!err) {
                    console.log("******event_deposit_by_token_log OK *******");
                    //console.log(events);
                    if (events) {
                        room = events.returnValues.sender.toLowerCase()
                        socket_io.to(room).emit("receive_message", "hello from deposit_by_token_log");

                        //chu bao ve update
                        chubaove.Update_deposit_Done([{
                            id: events.returnValues._id,
                            token_order: events.returnValues.token_order,
                            amount: module.exports.GetToEth(events.returnValues.amount)
                        }]);
                    }
                } else {
                    console.log("ERROR");
                }
            });
    },

    Get_event_deposit_by_default_log: async function (socket_io, chubaove) {
        await contractMM.events.deposit_by_default_log(
            {
                filter: {},
                fromBlock: "latest"
            }, function (err, events) {
                if (!err) {
                    console.log("******event deposit_by_default_log");
                    if (events) {
                        room = events.returnValues.sender.toLowerCase()
                        socket_io.to(room).emit("receive_message", "hello from event deposit_by_default_log");

                        //chu bao ve update
                        chubaove.Update_deposit_Done([{
                            id: events.returnValues._id,
                            token_order: -1,
                            amount: module.exports.GetToEth(events.returnValues.amount)
                        }]);
                    }
                } else {
                    console.log("contractMM.events.deposit_by_default_log ERROR: " + err);
                }
            });
    },

    ChuBaoVe_Get_event_deposit_by_default_log: async function (_ids) {

        if (!_ids || _ids.length == 0) return [];

        const results = await contractMM.getPastEvents(
            "deposit_by_default_log",
            {
                filter: { _id: _ids },
                fromBlock: 0,
                toBlock: "latest"
            });

        if (results && results.length > 0) {
            const depositdata = [];
            for (var idx = 0; idx < results.length; idx++) {
                depositdata.push({
                    id: results[idx].returnValues._id,
                    token_order: -1,
                    amount: module.exports.GetToEth(results[idx].returnValues.amount)
                });
            }
            return depositdata;
        }
        return [];
    },

    ChuBaoVe_Get_event_deposit_by_token_log: async function (_ids) {

        if (!_ids || _ids.length == 0) return [];

        const results = await contractMM.getPastEvents(
            "deposit_by_token_log",
            {
                filter: { _id: _ids },
                fromBlock: 0,
                toBlock: "latest"
            });

        if (results && results.length > 0) {
            const depositdata = [];
            for (var idx = 0; idx < results.length; idx++) {
                depositdata.push({
                    id: results[idx].returnValues._id,
                    token_order: results[idx].returnValues.token_order,
                    amount: module.exports.GetToEth(results[idx].returnValues.amount)
                });
            }
            return depositdata;
        }
        return [];
    },

    getContractMM: function () {
        return contractMM;
    },
    
    GetToWei: function (amount) {
        return web3.utils.toWei(amount, 'ether');
    },

    GetToEth: function (balance) {
        return web3.utils.fromWei(balance, "ether");
    }
};
