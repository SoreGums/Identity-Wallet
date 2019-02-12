// import { bindActionCreators } from 'redux';
import React from 'react';
import { connect } from 'react-redux';
import { getLocale } from 'common/locale/selectors';
import { getFiatCurrency } from 'common/fiatCurrency/selectors';
import { getTokens } from 'common/wallet-tokens/selectors';
import { CryptoPriceTable } from './crypto-price-table';
import { walletTokensOperations } from 'common/wallet-tokens';

const mapStateToProps = state => {
	return {
		...getLocale(state),
		...getFiatCurrency(state),
		tokens: getTokens(state),
		alwaysVisible: [
			'',
			'0x4cc19356f2d37338b9802aa8e8fc58b0373296e7',
			'0xcfec6722f119240b97effd5afe04c8a97caa02ee'
		]
	};
};

const CryptoPriceTableContainerComponent = props => (
	<CryptoPriceTable
		toggleAction={(event, token) => {
			event && event.preventDefault();
			props.dispatch(
				walletTokensOperations.updateWalletTokenStateOperation(
					1 - +token.recordState,
					token.id
				)
			);
		}}
		{...props}
	/>
);

export const CryptoPriceTableContainer = connect(mapStateToProps)(
	CryptoPriceTableContainerComponent
);

export default CryptoPriceTableContainer;