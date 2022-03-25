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
                fromBlock:"latest"
                //fromBlock: 0,
                //toBlock: "latest"
            }, function (err, events) {
                if (!err) {
                    console.log("******OK*******");
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

    getContractMM: function () {
        return contractMM;
    },
};


// import MetamaskValue from "./MetamaskValue"
// import Web3 from 'web3';

// const ABI = MetamaskValue.SM_PAYMENT_ABI;
// const ERC20_ABI = MetamaskValue.ERC20_ABI;
// export const SM_PAYMENT_ADDRESS = MetamaskValue.SM_PAYMENT_ADDRESS;
// const web3 = new Web3(window.ethereum);

// export const ContractMM = new web3.eth.Contract(ABI, SM_PAYMENT_ADDRESS);

// export function GetTokenContract(tokenAddress) {
//     return new web3.eth.Contract(ERC20_ABI, tokenAddress);
// }

// export async function GetCurrentMM_Address() {
//     await window.ethereum.enable();
//     const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//     var account = accounts[0];
//     window.ethereum.on('accountsChanged', function (accounts) {
//         // Time to reload your interface with accounts[0]!
//         account = accounts[0];
//     });

//     return account;
// }

// export async function GetTransactionDetail(txnHash){
//     return await web3.eth.getTransaction(txnHash);
// }

// export function GetToWei(amount){
//     return web3.utils.toWei(amount, 'ether');
// }

// export function GetToEth(balance){
//     return web3.utils.fromWei(balance, "ether");
// }