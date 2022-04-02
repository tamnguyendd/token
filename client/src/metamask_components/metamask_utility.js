import MetamaskValue from "./MetamaskValue"
import Web3 from 'web3';

const ABI = MetamaskValue.SM_PAYMENT_ABI;
const ERC20_ABI = MetamaskValue.ERC20_ABI;
const SM_PAYMENT_ADDRESS = MetamaskValue.SM_PAYMENT_ADDRESS;
const web3 = new Web3(window.ethereum);
const ContractMM = new web3.eth.Contract(ABI, SM_PAYMENT_ADDRESS);

export const mm_util = {
    SM_PAYMENT_ADDRESS: SM_PAYMENT_ADDRESS,
    ContractMM: ContractMM,
    GetTokenContract: function (tokenAddress) {
        return new web3.eth.Contract(ERC20_ABI, tokenAddress);
    },

    GetCurrentMM_Address: async function () {
        await window.ethereum.enable();
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        var account = accounts[0];
        window.ethereum.on('accountsChanged', function (accounts) {
            // Time to reload your interface with accounts[0]!
            account = accounts[0];
        });

        return account;
    },

    GetTransactionDetail: async function (txnHash) {
        return await web3.eth.getTransaction(txnHash);
    },

    GetDefaultBalance: async function (address) {
        const ethBalance = await web3.eth.getBalance(address);
        return web3.utils.fromWei(ethBalance, "ether");
    },

    GetToWei: function (amount) {
        return web3.utils.toWei(amount, 'ether');
    },

    GetToEth: function (balance) {
        return web3.utils.fromWei(balance, "ether");
    }
}



