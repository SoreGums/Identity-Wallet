const { Model } = require('objection');
const _ = require('lodash');
const BaseModel = require('./base');
const TABLE_NAME = 'wallet_settings';

class WalletSetting extends BaseModel {
	static get tableName() {
		return TABLE_NAME;
	}

	static get idColumn() {
		return 'id';
	}

	$parseDatabaseJson(json) {
		json = super.$parseDatabaseJson(json);
		if (json.hasOwnProperty('sowDesktopNotifications')) {
			json = {
				..._.omit(json, 'sowDesktopNotifications'),
				showDesktopNotifications: json.sowDesktopNotifications
			};
		}
		return json;
	}

	$formatDatabaseJson(json) {
		json = super.$formatDatabaseJson(json);
		if (json.hasOwnProperty('showDesktopNotifications')) {
			json = {
				..._.omit(json, 'showDesktopNotifications'),
				sowDesktopNotifications: json.showDesktopNotifications
			};
		}
		return json;
	}

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['walletId'],
			properties: {
				id: { type: 'integer' },
				walletId: { type: 'integer' },
				showDesktopNotifications: { type: 'integer' },
				previousTransactionCount: { type: 'integer' },
				txHistoryLastSyncedBlock: { type: 'integer' },
				airDropCode: { type: ['string', 'null'] }
			}
		};
	}

	static get relationMappings() {
		const Wallet = require('./wallet');
		return {
			wallet: {
				relation: Model.BelongsToOneRelation,
				modelClass: Wallet,
				join: {
					from: `${this.tableName}.walletId`,
					to: `${Wallet.tableName}.id`
				}
			}
		};
	}

	static create(itm) {
		return this.query().insertAndFetch(itm);
	}

	static findByWalletId(walletId, tx) {
		return this.query(tx).findOne({ walletId });
	}

	static updateById(id, itm, tx) {
		return this.query(tx).patchAndFetchById(id, itm);
	}
}

module.exports = WalletSetting;