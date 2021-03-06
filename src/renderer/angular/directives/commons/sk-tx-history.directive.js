'use strict';
const { Logger } = require('common/logger/logger');
const log = new Logger('SKTxHistoryDirective');
function SKTxHistoryDirective($rootScope, $interval, $filter, RPCService, CommonService) {
	'ngInject';

	return {
		restrict: 'E',
		scope: {
			tokenSymbol: '@'
		},
		link: (scope, element) => {
			let publicKey = '0x' + $rootScope.wallet.getPublicKey();
			let publicKeyLowerCase = publicKey.toLowerCase();

			scope.hasPager = false;
			scope.pager = {
				perPage: 10,
				page: 1
			};
			let pager = scope.pager;
			scope.total = 0;

			let syncByWallet = showProgress => {
				RPCService.makeCall('syncTxHistoryByWallet', {
					walletId: $rootScope.wallet.id,
					publicKey: publicKeyLowerCase,
					showProgress
				});
			};

			$rootScope.txHistoryIsFirstSync =
				typeof $rootScope.txHistoryIsFirstSync === 'undefined';
			syncByWallet($rootScope.txHistoryIsFirstSync);

			scope.txList = [];
			scope.tokenSymbol = scope.tokenSymbol ? scope.tokenSymbol.toUpperCase() : null;

			let getTxStatusText = tx => {
				let status = tx.txReceiptStatus;
				let isSend = tx.from === publicKeyLowerCase;

				if (status === 0) {
					return isSend ? 'Faild to send' : 'Faild to receive';
				}
				if (status === 1) {
					return isSend ? 'Sent' : 'Received';
				}
				return isSend ? 'Sending' : 'Receiving';
			};

			let getTxStatusIconName = tx => {
				let status = tx.txReceiptStatus;
				let isSend = tx.from === publicKeyLowerCase;

				if (status === 1) {
					return isSend ? 'sent' : 'receive';
				}

				if (status === 0) {
					return 'failed';
				}

				return 'hourglass';
			};

			let processTxHistoryList = list => {
				return list.map(tx => {
					let directionSign = publicKeyLowerCase === tx.from ? '- ' : '+ ';
					tx.value = directionSign + tx.value;

					let symbol = tx.tokenSymbol;
					tx.cryptoCurrency = symbol ? symbol.toUpperCase() : 'ETH';

					let testnet = tx.networkId === 3 ? 'ropsten.' : '';
					tx.externalLink = `https://${testnet}etherscan.io/tx/${tx.hash}`;
					tx.statusText = getTxStatusText(tx);
					tx.statusIconName = getTxStatusIconName(tx);
					tx.date = $filter('date')(tx.timeStamp, 'yyyy-dd-MM h:mm:ss a');

					return tx;
				});
			};

			let loadData = () => {
				let fn;
				let fnArgs = { publicKey: publicKeyLowerCase, pager };
				if (scope.tokenSymbol) {
					if (scope.tokenSymbol === 'ETH') {
						fn = 'getByPublicKeyAndContractAddress';
						fnArgs.contractAddress = null;
					} else {
						fn = 'getTxHistoryByPublicKeyAndTokenSymbol';
						fnArgs.tokenSymbol = scope.tokenSymbol;
					}
				}

				fn = fn || 'getTxHistoryByPublicKey';
				RPCService.makeCall(fn, fnArgs)
					.then(res => {
						scope.txList = processTxHistoryList(res.data);
						scope.isSyncing = res.isSyncing;
						scope.total = res.pagination.total;
						scope.hasPager = scope.total > pager.perPage;
					})
					.catch(err => {
						log.error(err);
						scope.isSyncing = false;
						CommonService.showToast(
							'error',
							'Error while loading transactions history.'
						);
					});
			};

			loadData();

			$rootScope.$on('balance:change', event => {
				loadData();
			});

			$rootScope.$on('tx-history:change', event => {
				loadData();
			});

			$rootScope.$on('tx-history:sync', event => {
				scope.isSyncing = true;
				syncByWallet(true);
			});

			let txReloadInterval = $interval(() => {
				loadData();
			}, 3000);

			scope.onPageChange = isNext => {
				isNext ? ++pager.page : --pager.page;
				if (pager.page < 1) {
					pager.page = 1;
				}
				loadData();
			};

			element.on('$destroy', function() {
				$interval.cancel(txReloadInterval);
			});
		},
		replace: true,
		templateUrl: 'common/directives/sk-tx-history.html'
	};
}

SKTxHistoryDirective.$inject = [
	'$rootScope',
	'$interval',
	'$filter',
	'RPCService',
	'CommonService'
];

module.exports = SKTxHistoryDirective;
