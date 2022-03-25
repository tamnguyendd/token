import MetamaskValue from "../MetamaskValue"
import Web3 from 'web3';

const ABI = MetamaskValue.SM_PAYMENT_ABI;
const ERC20_ABI = MetamaskValue.ERC20_ABI;
export const SM_PAYMENT_ADDRESS = MetamaskValue.SM_PAYMENT_ADDRESS;
const web3 = new Web3(window.ethereum);

export const ContractMM = new web3.eth.Contract(ABI, SM_PAYMENT_ADDRESS);

export function GetTokenContract(tokenAddress) {
    return new web3.eth.Contract(ERC20_ABI, tokenAddress);
}

export async function GetCurrentMM_Address() {
    await window.ethereum.enable();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    var account = accounts[0];
    window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        account = accounts[0];
    });

    return account;
}

export async function GetTransactionDetail(txnHash){
    return await web3.eth.getTransaction(txnHash);
}

export function GetToWei(amount){
    return web3.utils.toWei(amount, 'ether');
}

export function GetToEth(balance){
    return web3.utils.fromWei(balance, "ether");
}