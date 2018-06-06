const Wallet = requireAppModule('angular/classes/wallet');
const EthUnits = requireAppModule('angular/classes/eth-units');
const EthUtils = requireAppModule('angular/classes/eth-utils');
const Token = requireAppModule('angular/classes/token');

function dec2hexString(dec) {
    return '0x' + (dec + 0x10000).toString(16).substr(-4).toUpperCase();
}

// documentation
// https://www.myetherapi.com/
function Web3Service($rootScope, $window, $log, EVENTS, SqlLiteService, RPCService) {
    'ngInject';

    $log.info('Web3Service Initialized');

    /**
     *
     */
    class Web3Service {

        constructor() {
            Web3Service.web3 = new Web3();
            EthUtils.web3 = new Web3();
            window.EthUtils = EthUtils;
        }

        static getContractPastEvents(contractAddress, args) {
            return Web3Service.waitForTicket('getPastEvents', args, contractAddress);
        }

        getContractInfo(contractAddress) {

            let decimalsPromise = Web3Service.waitForTicket('call', [], contractAddress, 'decimals');
            let symbolPromise = Web3Service.waitForTicket('call', [], contractAddress, 'symbol');

            return Promise.all([decimalsPromise, symbolPromise]);
        }

        getMostRecentBlockNumber() {
            return Web3Service.waitForTicket('getBlockNumber', []);
        }

        static getMostRecentBlockNumberStatic() {
            return Web3Service.waitForTicket('getBlockNumber', []);
        }

        getBalance(addressHex) {
            return Web3Service.waitForTicket('getBalance', [addressHex]);
        }

        getTokenBalanceByData(data) {
            return Web3Service.waitForTicket('call', [data]);
        }

        getEstimateGas(fromAddressHex, toAddressHex, amountHex) {
            let args = {
                "from": fromAddressHex,
                "to": toAddressHex,
                "value": amountHex
            }

            return Web3Service.waitForTicket('estimateGas', [args]);
        }

        getGasPrice() {
            return Web3Service.waitForTicket('getGasPrice', []);
        }

        getTransactionCount(addressHex) {
            return Web3Service.waitForTicket('getTransactionCount', [addressHex, 'pending']);
        }

        sendRawTransaction(signedTxHex) {
            return Web3Service.waitForTicket('sendSignedTransaction', [signedTxHex]);
        }

        getTransaction(transactionHex) {
            return Web3Service.waitForTicket('getTransaction', [transactionHex]);
        }

        getTransactionReceipt(transactionHex) {
            return Web3Service.waitForTicket('getTransactionReceipt', [transactionHex]);
        }

        static getBlock(blockNumber, withTransactions) {
            withTransactions = withTransactions || false;
            return Web3Service.waitForTicket('getBlock', [blockNumber, withTransactions]);
        }

        static waitForTicket(method, args, contractAddress, contractMethod) {
            return RPCService.makeCall('waitForWeb3Ticket', { method, args, contractAddress, contractMethod });
        }
    };

    return new Web3Service();
}

module.exports = Web3Service;
