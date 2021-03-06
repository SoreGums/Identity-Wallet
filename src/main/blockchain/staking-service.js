import fetch from 'node-fetch';

import CONFIG from 'common/config';
import { abi as SELFKEY_ABI } from 'main/assets/data/abi.json';
import { Token } from '../token/token';
import BN from 'bignumber.js';

// TODO: use selfkey domain here
const CONFIG_URL =
	'https://us-central1-kycchain-master.cloudfunctions.net/airtable?tableName=Contracts';

export class StakingService {
	constructor({ web3Service }) {
		this.activeContract = null;
		this.deprecatedContracts = [];
		this.web3 = web3Service;
	}
	async getStakingInfo(serviceAddress, serviceId, options) {
		let info = { balance: 0, serviceAddress, serviceId, contract: null, releaseDate: 0 };
		let contracts = [this.activeContract].concat(this.deprecatedContracts);
		let balance = 0;
		options = { ...options };
		for (let i = 0; i < contracts.length; i++) {
			try {
				balance = await contracts[i].getBalance(serviceAddress, serviceId, options);
			} catch (error) {
				balance = 0;
			}
			if (!balance) continue;
			info.balance = balance;
			info.contract = contracts[i];
			if (!contracts[i].isDeprecated) {
				info.releaseDate = await contracts[i].getReleaseDate(
					serviceAddress,
					serviceId,
					options
				);
			}
			return info;
		}
		return info;
	}
	async placeStake(ammount, serviceAddress, serviceId, options) {
		let hashes = {};
		options = { ...options };
		let totalGas = options.gas;
		let approveGas, depositGas;
		let allowance = new BN(
			await this.tokenContract.allowance(this.activeContract.address, {
				from: options.from
			})
		);
		let hasAllowance = allowance.gte(new BN(ammount));
		if (!hasAllowance && totalGas) {
			approveGas = await this.tokenContract.approve(this.activeContract.address, ammount, {
				from: options.from,
				method: 'estimateGas',
				value: '0x00'
			});
			depositGas = totalGas - approveGas;
		}
		if (!hasAllowance) {
			hashes.approve = await this.tokenContract.approve(
				this.activeContract.address,
				ammount,
				{
					...options,
					gas: approveGas
				}
			);
		}
		hashes.deposit = await this.activeContract.deposit(ammount, serviceAddress, serviceId, {
			...options,
			gas: depositGas
		});
		return hashes;
	}
	async withdrawStake(serviceAddress, serviceId, options) {
		let info = await this.getStakingInfo(serviceAddress, serviceId, options);
		if (!info.contract) throw new Error('no contract to withdraw from');
		if (!info.contract.isDeprecated && Date.now() < info.releaseDate)
			throw new Error('stake is locked');
		return info.contract.withdraw(serviceAddress, serviceId, options);
	}
	parseRemoteConfig(entities) {
		return entities
			.map(entity => entity.data)
			.sort((d1, d2) => {
				d1 = d1.createdAt ? new Date(d1.createdAt).getTime() : 0;
				d2 = d2.createdAt ? new Date(d2.createdAt).getTime() : 0;
				return d1 - d2;
			})
			.reduce(
				(acc, curr) => {
					curr = { ...curr, abi: JSON.parse(curr.abi || '{}') };
					if (curr.deprecated) {
						acc.deprecatedContracts.push(curr);
						return acc;
					}
					acc.activeContract = curr;
					return acc;
				},
				{ activeContract: null, deprecatedContracts: [] }
			);
	}
	async fetchConfig() {
		try {
			let res = await fetch(CONFIG_URL);
			let data = await res.json();
			if (!data.entities) {
				throw new Error('Invalid responce');
			}
			return this.parseRemoteConfig(data.entities);
		} catch (error) {
			console.error(error);
			throw new Error('Could not fetch from airtable');
		}
	}
	async acquireContract() {
		let { activeContract, deprecatedContracts } = await this.fetchConfig();
		this.activeContract = new StakingContract(
			this.web3,
			activeContract.address,
			activeContract.abi,
			!!activeContract.deprecated
		);
		this.deprecatedContracts = deprecatedContracts.map(
			contract =>
				new StakingContract(
					this.web3,
					contract.address,
					contract.abi,
					!!contract.deprecated
				)
		);
		let token = await Token.findOneBySymbol(CONFIG.constants.primaryToken);
		this.tokenContract = new SelfKeyTokenContract(this.web3, token);
	}
}

export class EtheriumContract {
	constructor(web3, address, abi) {
		this.web3 = web3;
		this.address = address;
		this.abi = abi;
	}

	async send(options) {
		const { args } = options;
		const contractMethod = options.method;
		const opt = options.options;
		const method = opt.method || 'send';
		const onceListenerName = method === 'send' ? 'transactionHash' : null;
		if (method === 'estimateGas') {
			// TODO: fix generic gas estimation
			return 100000;
		}
		if (!opt.gas) {
			opt.gas = 100000;
		}
		let hash = await this.web3.waitForTicket({
			method,
			contractMethodArgs: args || [],
			contractAddress: this.address,
			contractMethod,
			customAbi: this.abi,
			onceListenerName,
			args: [opt]
		});
		// TODO: add pending transactions to db
		return hash;
	}

	call(options) {
		return this.web3.waitForTicket({
			method: 'call',
			contractMethodArgs: options.args || [],
			contractAddress: this.address,
			contractMethod: options.method,
			customAbi: this.abi,
			args: [options.options || {}]
		});
	}
}

export class StakingContract extends EtheriumContract {
	constructor(web3, address, abi, isDeprecated) {
		super(web3, address, abi);
		this.isDeprecated = isDeprecated;
	}

	getBalance(serviceAddress, serviceId, options) {
		return this.call({
			args: [options.from, serviceAddress, serviceId],
			options,
			method: 'balances'
		});
	}

	deposit(ammount, serviceAddress, serviceId, options) {
		options = { method: 'send', ...options };
		return this[options.method]({
			args: [ammount, serviceAddress, serviceId],
			options,
			method: 'deposit'
		});
	}

	withdraw(serviceAddress, serviceId, options) {
		options = { method: 'send', ...options };
		return this[options.method]({
			args: [serviceAddress, serviceId],
			options,
			method: 'withdraw'
		});
	}

	getReleaseDate(serviceAddress, serviceId, options) {
		return this.call({
			args: [options.from, serviceAddress, serviceId],
			options,
			method: 'releaseDates'
		});
	}

	getLockPeriod(serviceAddress, serviceId, options) {
		return this.call({
			args: [serviceAddress, serviceId],
			options: { ...options },
			method: 'lockPeriods'
		});
	}
}

export class SelfKeyTokenContract extends EtheriumContract {
	constructor(web3, token) {
		super(web3, token.address, SELFKEY_ABI);
		this.token = token;
	}
	approve(depositVaultAddress, maxAmmount, options) {
		options = { method: 'send', ...options };
		return this[options.method]({
			args: [depositVaultAddress, maxAmmount],
			options,
			method: 'approve'
		});
	}

	allowance(depositVaultAddress, options) {
		return this.call({
			args: [options.from, depositVaultAddress],
			options: { ...options },
			method: 'allowance'
		});
	}
}

export default StakingService;
