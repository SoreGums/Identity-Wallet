import sinon from 'sinon';
import { setGlobalContext } from '../context';
import {
	identityActions,
	identityTypes,
	identityReducers,
	initialState,
	identitySelectors,
	testExports
} from './index';

describe('Identity Duck', () => {
	let identityService = {
		loadRepositories() {},
		updateRepositories() {},
		loadIdAttributeTypes() {},
		updateIdAttributeTypes() {},
		loadUiSchemas() {},
		updateUiSchemas() {},
		loadDocuments() {},
		loadIdAttributes() {},
		loadDocumentsForAttribute() {}
	};
	let state = {};
	let store = {
		dispatch() {},
		getState() {
			return state;
		}
	};
	const testAction = { test: 'test' };
	beforeEach(() => {
		sinon.restore();
		state = { identity: { ...initialState } };
		setGlobalContext({ identityService: identityService });
	});
	describe('Repositories', () => {
		let now = Date.now();
		let testRepos = [
			{ id: 1, url: 'test', expires: now - 50000 },
			{ id: 2, url: 'test1', expires: now + 50000 },
			{ id: 3, url: 'test2', expires: now - 50000 }
		];
		let expiredRepos = testRepos.filter(repo => repo.expires <= now);
		describe('Operations', () => {
			it('loadRepositoriesOperation', async () => {
				sinon.stub(identityService, 'loadRepositories').resolves(testRepos);
				sinon.stub(store, 'dispatch');
				sinon.stub(identityActions, 'setRepositoriesAction').returns(testAction);

				await testExports.operations.loadRepositoriesOperation()(
					store.dispatch,
					store.getState.bind(store)
				);

				expect(identityService.loadRepositories.calledOnce).toBeTruthy();
				expect(store.dispatch.calledOnceWith(testAction)).toBeTruthy();
			});
			it('updateExpiredRepositoriesOperation', async () => {
				sinon.stub(identitySelectors, 'selectExpiredRepositories').returns(expiredRepos);
				sinon.stub(identityService, 'updateRepositories').resolves('ok');
				sinon.stub(testExports.operations, 'loadRepositoriesOperation');

				await testExports.operations.updateExpiredRepositoriesOperation()(
					store.dispatch,
					store.getState.bind(store)
				);

				expect(identitySelectors.selectExpiredRepositories.calledOnce).toBeTruthy();
				expect(
					identityService.updateRepositories.calledOnceWith(expiredRepos)
				).toBeTruthy();
				expect(testExports.operations.loadRepositoriesOperation.calledOnce).toBeTruthy();
			});
		});
		describe('Actions', () => {
			it('setRepositoriesAction', () => {
				expect(identityActions.setRepositoriesAction(testRepos)).toEqual({
					type: identityTypes.IDENTITY_REPOSITORIES_SET,
					payload: testRepos
				});
			});
		});
		describe('Reducers', () => {
			it('setRepositoriesReducer', () => {
				let state = {
					repositories: [],
					repositoriesById: {}
				};
				let newState = identityReducers.setRepositoriesReducer(
					state,
					identityActions.setRepositoriesAction([testRepos[0]])
				);

				expect(newState).toEqual({
					repositories: [testRepos[0].id],
					repositoriesById: {
						[testRepos[0].id]: testRepos[0]
					}
				});
			});
		});
		describe('Selectors', () => {
			beforeEach(() => {
				state.identity.repositories = testRepos.map(repo => repo.id);
				state.identity.repositoriesById = testRepos.reduce((acc, curr) => {
					acc[curr.id] = curr;
					return acc;
				}, {});
			});
			it('selectRepositories', () => {
				expect(identitySelectors.selectRepositories(state)).toEqual(testRepos);
			});
			it('selectExpiredRepositories', () => {
				expect(identitySelectors.selectExpiredRepositories(state)).toEqual(expiredRepos);
			});
		});
	});
	describe('IdAttributeTypes', () => {
		let now = Date.now();
		const testIdAttributeTypes = [
			{ id: 1, url: 'test', expires: now - 50000 },
			{ id: 2, url: 'test1', expires: now + 50000 },
			{ id: 3, url: 'test2', expires: now - 50000 }
		];
		let expiredIdAttributeTypes = testIdAttributeTypes.filter(type => type.expires <= now);
		describe('Operations', () => {
			it('loadIdAttributeTypesOperation', async () => {
				sinon.stub(identityService, 'loadIdAttributeTypes').resolves(testIdAttributeTypes);
				sinon.stub(store, 'dispatch');
				sinon.stub(identityActions, 'setIdAttributeTypesAction').returns(testAction);

				await testExports.operations.loadIdAttributeTypesOperation()(
					store.dispatch,
					store.getState.bind(store)
				);

				expect(identityService.loadIdAttributeTypes.calledOnce).toBeTruthy();
				expect(store.dispatch.calledOnceWith(testAction)).toBeTruthy();
			});
			it('updateExpiredIdAttributeTypesOperation', async () => {
				sinon
					.stub(identitySelectors, 'selectExpiredIdAttributeTypes')
					.returns(expiredIdAttributeTypes);
				sinon.stub(identityService, 'updateIdAttributeTypes').resolves('ok');
				sinon.stub(testExports.operations, 'loadIdAttributeTypesOperation');

				await testExports.operations.updateExpiredIdAttributeTypesOperation()(
					store.dispatch,
					store.getState.bind(store)
				);

				expect(identitySelectors.selectExpiredIdAttributeTypes.calledOnce).toBeTruthy();
				expect(
					identityService.updateIdAttributeTypes.calledOnceWith(expiredIdAttributeTypes)
				).toBeTruthy();
				expect(
					testExports.operations.loadIdAttributeTypesOperation.calledOnce
				).toBeTruthy();
			});
		});
		describe('Actions', () => {
			it('setIdAttributeTypesAction', () => {
				expect(identityActions.setIdAttributeTypesAction(testIdAttributeTypes)).toEqual({
					type: identityTypes.IDENTITY_ID_ATTRIBUTE_TYPES_SET,
					payload: testIdAttributeTypes
				});
			});
		});
		describe('Reducers', () => {
			it('setIdAttributeTypesReducer', () => {
				let state = {
					idAtrributeTypes: [],
					idAtrributeTypesById: {}
				};
				let newState = identityReducers.setIdAttributeTypesReducer(
					state,
					identityActions.setIdAttributeTypesAction([testIdAttributeTypes[0]])
				);

				expect(newState).toEqual({
					idAtrributeTypes: [testIdAttributeTypes[0].id],
					idAtrributeTypesById: {
						[testIdAttributeTypes[0].id]: testIdAttributeTypes[0]
					}
				});
			});
		});
		describe('Selectors', () => {
			beforeEach(() => {
				state.identity.idAtrributeTypes = testIdAttributeTypes.map(repo => repo.id);
				state.identity.idAtrributeTypesById = testIdAttributeTypes.reduce((acc, curr) => {
					acc[curr.id] = curr;
					return acc;
				}, {});
			});
			it('selectIdAttributeTypes', () => {
				expect(identitySelectors.selectIdAttributeTypes(state)).toEqual(
					testIdAttributeTypes
				);
			});
			it('selectExpiredIdAttributeTypes', () => {
				expect(identitySelectors.selectExpiredIdAttributeTypes(state)).toEqual(
					expiredIdAttributeTypes
				);
			});
		});
	});
	describe('uiSchemas', () => {
		let now = Date.now();
		const testUiSchemas = [
			{ id: 1, url: 'test', expires: now - 50000 },
			{ id: 2, url: 'test1', expires: now + 50000 },
			{ id: 3, url: 'test2', expires: now - 50000 }
		];
		let expiredUiSchemas = testUiSchemas.filter(uiSchema => uiSchema.expires <= now);
		describe('Operations', () => {
			it('loadUiSchemasOperation', async () => {
				sinon.stub(identityService, 'loadUiSchemas').resolves(testUiSchemas);
				sinon.stub(store, 'dispatch');
				sinon.stub(identityActions, 'setUiSchemasAction').returns(testAction);

				await testExports.operations.loadUiSchemasOperation()(
					store.dispatch,
					store.getState.bind(store)
				);

				expect(identityService.loadUiSchemas.calledOnce).toBeTruthy();
				expect(store.dispatch.calledOnceWith(testAction)).toBeTruthy();
			});
			it('updateExpiredUiSchemasOperation', async () => {
				sinon.stub(identitySelectors, 'selectExpiredUiSchemas').returns(expiredUiSchemas);
				sinon.stub(identityService, 'updateUiSchemas').resolves('ok');
				sinon.stub(testExports.operations, 'loadUiSchemasOperation');

				await testExports.operations.updateExpiredUiSchemasOperation()(
					store.dispatch,
					store.getState.bind(store)
				);

				expect(identitySelectors.selectExpiredUiSchemas.calledOnce).toBeTruthy();
				expect(
					identityService.updateUiSchemas.calledOnceWith(expiredUiSchemas)
				).toBeTruthy();
				expect(testExports.operations.loadUiSchemasOperation.calledOnce).toBeTruthy();
			});
		});
		describe('Actions', () => {
			it('setUiSchemasAction', () => {
				expect(identityActions.setUiSchemasAction(testUiSchemas)).toEqual({
					type: identityTypes.IDENTITY_UI_SCHEMAS_SET,
					payload: testUiSchemas
				});
			});
		});
		describe('Reducers', () => {
			it('setUiSchemasReducer', () => {
				let state = {
					uiSchemas: [],
					uiSchemasById: {}
				};
				let newState = identityReducers.setUiSchemasReducer(
					state,
					identityActions.setUiSchemasAction([testUiSchemas[0]])
				);

				expect(newState).toEqual({
					uiSchemas: [testUiSchemas[0].id],
					uiSchemasById: {
						[testUiSchemas[0].id]: testUiSchemas[0]
					}
				});
			});
		});
		describe('Selectors', () => {
			beforeEach(() => {
				state.identity.uiSchemas = testUiSchemas.map(repo => repo.id);
				state.identity.uiSchemasById = testUiSchemas.reduce((acc, curr) => {
					acc[curr.id] = curr;
					return acc;
				}, {});
			});
			it('selectUiSchemas', () => {
				expect(identitySelectors.selectUiSchemas(state)).toEqual(testUiSchemas);
			});
			it('selectExpiredUiSchemas', () => {
				expect(identitySelectors.selectExpiredUiSchemas(state)).toEqual(expiredUiSchemas);
			});
		});
	});
	describe('Documents', () => {
		let testWalletId = 1;
		let testAttributeId = 1;
		let testDocuments = [
			{ id: 1, walletId: testWalletId, attributeId: testAttributeId },
			{ id: 2, walletId: testWalletId, attributeId: testAttributeId }
		];
		let testDocumentsRaw = testDocuments.map(doc => {
			doc = { ...doc };
			delete doc.walletId;
			return doc;
		});
		describe('Operation', () => {
			it('loadDocumentsOperation', async () => {
				sinon.stub(identityService, 'loadDocuments').resolves(testDocumentsRaw);
				sinon.stub(store, 'dispatch');
				sinon.stub(identityActions, 'setDocumentsAction').returns(testAction);

				await testExports.operations.loadDocumentsOperation(testWalletId)(
					store.dispatch,
					store.getState.bind(store)
				);

				expect(identityService.loadDocuments.calledOnceWith(testWalletId)).toBeTruthy();
				expect(store.dispatch.calledOnceWith(testAction)).toBeTruthy();
			});
			it('loadDocumentsForAttributeOperation', async () => {
				sinon.stub(identityService, 'loadDocumentsForAttribute').resolves(testDocumentsRaw);
				sinon.stub(store, 'dispatch');
				sinon.stub(identityActions, 'setDocumentsForAttributeAction').returns(testAction);

				await testExports.operations.loadDocumentsForAttributeOperation(testAttributeId)(
					store.dispatch,
					store.getState.bind(store)
				);

				expect(
					identityService.loadDocumentsForAttribute.calledOnceWith(testAttributeId)
				).toBeTruthy();
				expect(store.dispatch.calledOnceWith(testAction)).toBeTruthy();
			});
		});
		describe('Actions', () => {
			it('setDocumentsAction', () => {
				expect(identityActions.setDocumentsAction(testWalletId, testDocuments)).toEqual({
					type: identityTypes.IDENTITY_DOCUMENTS_SET,
					payload: { walletId: testWalletId, documents: testDocuments }
				});
			});
			it('setDocumentsForAttributeAction', () => {
				expect(
					identityActions.setDocumentsForAttributeAction(testAttributeId, testDocuments)
				).toEqual({
					type: identityTypes.IDENTITY_ATTRIBUTE_DOCUMENTS_SET,
					payload: { attributeId: testAttributeId, documents: testDocuments }
				});
			});
			it('deleteDocumentsForAttributeAction', () => {
				expect(identityActions.deleteDocumentsForAttributeAction(testAttributeId)).toEqual({
					type: identityTypes.IDENTITY_ATTRIBUTE_DOCUMENTS_DELETE,
					payload: testAttributeId
				});
			});
			it('deleteDocumentsAction', () => {
				expect(identityActions.deleteDocumentsAction(testWalletId)).toEqual({
					type: identityTypes.IDENTITY_DOCUMENTS_DELETE,
					payload: testWalletId
				});
			});
			it('addDocumentAction', () => {
				expect(identityActions.addDocumentAction(testDocuments[0])).toEqual({
					type: identityTypes.IDENTITY_DOCUMENT_ADD,
					payload: testDocuments[0]
				});
			});
			it('updateDocumentAction', () => {
				expect(identityActions.updateDocumentAction(testDocuments[0])).toEqual({
					type: identityTypes.IDENTITY_DOCUMENT_UPDATE,
					payload: testDocuments[0]
				});
			});
		});
		describe('Reducers', () => {
			it('setDocumentsReducer', async () => {
				let state = {
					documents: [3],
					documentsById: { 3: { id: 3, walletId: 2 } }
				};
				let newState = identityReducers.setDocumentsReducer(
					state,
					identityActions.setDocumentsAction(testWalletId, [testDocuments[0]])
				);

				expect(newState).toEqual({
					documents: [3, testDocuments[0].id],
					documentsById: {
						3: { id: 3, walletId: 2 },
						[testDocuments[0].id]: testDocuments[0]
					}
				});
			});
			it('deleteDocumentsReducer', async () => {
				let state = {
					documents: [1, 2, 3],
					documentsById: {
						1: testDocuments[0],
						2: testDocuments[1],
						3: { id: 3, walletId: 2 }
					}
				};
				let newState = identityReducers.deleteDocumentsReducer(
					state,
					identityActions.deleteDocumentsAction(testWalletId)
				);

				expect(newState).toEqual({
					documents: [3],
					documentsById: {
						3: { id: 3, walletId: 2 }
					}
				});
			});
			it('addDocumentReducer', async () => {
				let state = {
					documents: [1, 2],
					documentsById: {
						1: testDocuments[0],
						2: testDocuments[1]
					}
				};
				let newState = identityReducers.addDocumentReducer(
					state,
					identityActions.addDocumentAction({ id: 3, walletId: 2 })
				);

				expect(newState).toEqual({
					documents: [1, 2, 3],
					documentsById: {
						1: testDocuments[0],
						2: testDocuments[1],
						3: { id: 3, walletId: 2 }
					}
				});
			});
			it('updateDocumentReducer', async () => {
				let state = {
					documents: [1, 3],
					documentsById: {
						1: testDocuments[0],
						3: { id: 3, walletId: 2, mimeType: 'test', name: 'test' }
					}
				};
				let newState = identityReducers.updateDocumentReducer(
					state,
					identityActions.updateDocumentAction({ id: 3, walletId: 2, mimeType: 'test2' })
				);

				expect(newState).toEqual({
					documents: [1, 3],
					documentsById: {
						1: testDocuments[0],
						3: { id: 3, walletId: 2, mimeType: 'test2', name: 'test' }
					}
				});
			});
			it('setAttributeDocumentsReducer', async () => {
				let state = {
					documents: [3],
					documentsById: { 3: { id: 3, walletId: 1, attributeId: 2 } }
				};
				let newState = identityReducers.setAttributeDocumentsReducer(
					state,
					identityActions.setDocumentsForAttributeAction(testAttributeId, testDocuments)
				);

				expect(newState).toEqual({
					documents: [3, ...testDocuments.map(d => d.id)],
					documentsById: {
						3: { id: 3, walletId: 1, attributeId: 2 },
						[testDocuments[0].id]: testDocuments[0],
						[testDocuments[1].id]: testDocuments[1]
					}
				});
			});
			it('deleteAttributeDocumentsReducer', async () => {
				let state = {
					documents: [1, 2, 3],
					documentsById: {
						1: testDocuments[0],
						2: testDocuments[1],
						3: { id: 3, walletId: 1, attributeId: 2 }
					}
				};
				let newState = identityReducers.deleteAttributeDocumentsReducer(
					state,
					identityActions.deleteDocumentsForAttributeAction(testAttributeId)
				);

				expect(newState).toEqual({
					documents: [3],
					documentsById: {
						3: { id: 3, walletId: 1, attributeId: 2 }
					}
				});
			});
		});
		describe('Selectors', () => {
			beforeEach(() => {
				state.identity.documents = [...testDocuments, { id: 3, walletId: 2 }].map(
					repo => repo.id
				);
				state.identity.documentsById = [...testDocuments, { id: 3, walletId: 2 }].reduce(
					(acc, curr) => {
						acc[curr.id] = curr;
						return acc;
					},
					{}
				);
			});
			it('selectDocuments', () => {
				expect(identitySelectors.selectDocuments(state, testWalletId)).toEqual(
					testDocuments
				);
			});
		});
	});
	describe('IdAttributes', () => {
		let testWalletId = 1;
		let testIdAttributes = [
			{ id: 1, walletId: testWalletId, typeId: 1 },
			{ id: 2, walletId: testWalletId, typeId: 2 }
		];
		describe('Operation', () => {
			it('loadIdAttributesOperation', async () => {
				sinon.stub(identityService, 'loadIdAttributes').resolves(testIdAttributes);
				sinon.stub(store, 'dispatch');
				sinon.stub(identityActions, 'setIdAttributesAction').returns(testAction);

				await testExports.operations.loadIdAttributesOperation(testWalletId)(
					store.dispatch,
					store.getState.bind(store)
				);

				expect(identityService.loadIdAttributes.calledOnceWith(testWalletId)).toBeTruthy();
				expect(store.dispatch.calledOnceWith(testAction)).toBeTruthy();
			});
			it('createIdAttributeOperation', async () => {});
		});
		describe('Actions', () => {
			it('setIdAttributesAction', () => {
				expect(
					identityActions.setIdAttributesAction(testWalletId, testIdAttributes)
				).toEqual({
					type: identityTypes.IDENTITY_ATTRIBUTES_SET,
					payload: { walletId: testWalletId, attributes: testIdAttributes }
				});
			});
			it('deleteIdAttributesAction', () => {
				expect(identityActions.deleteIdAttributesAction(testWalletId)).toEqual({
					type: identityTypes.IDENTITY_ATTRIBUTES_DELETE,
					payload: testWalletId
				});
			});
			it('addIdAttributeAction', () => {
				expect(identityActions.addIdAttributeAction(testIdAttributes[0])).toEqual({
					type: identityTypes.IDENTITY_ATTRIBUTE_ADD,
					payload: testIdAttributes[0]
				});
			});
		});
		describe('Reducers', () => {
			it('setIdAttributesReducer', async () => {
				let state = {
					attributes: [3],
					attributesById: { 3: { id: 3, walletId: 2, typeId: 3 } }
				};
				let newState = identityReducers.setIdAttributesReducer(
					state,
					identityActions.setIdAttributesAction(testWalletId, [testIdAttributes[0]])
				);

				expect(newState).toEqual({
					attributes: [3, testIdAttributes[0].id],
					attributesById: {
						3: { id: 3, walletId: 2, typeId: 3 },
						[testIdAttributes[0].id]: testIdAttributes[0]
					}
				});
			});
			it('deleteIdAttributesReducer', async () => {
				let state = {
					attributes: [1, 2, 3],
					attributesById: {
						1: testIdAttributes[0],
						2: testIdAttributes[1],
						3: { id: 3, walletId: 2, typeId: 3 }
					}
				};
				let newState = identityReducers.deleteIdAttributesReducer(
					state,
					identityActions.deleteIdAttributesAction(testWalletId)
				);

				expect(newState).toEqual({
					attributes: [3],
					attributesById: {
						3: { id: 3, walletId: 2, typeId: 3 }
					}
				});
			});
			it('addIdAttributeReducer', async () => {
				let state = {
					attributes: [1, 2],
					attributesById: {
						1: testIdAttributes[0],
						2: testIdAttributes[1]
					}
				};
				let newState = identityReducers.addIdAttributeReducer(
					state,
					identityActions.addIdAttributeAction({ id: 3, walletId: 2, typeId: 3 })
				);

				expect(newState).toEqual({
					attributes: [1, 2, 3],
					attributesById: {
						1: testIdAttributes[0],
						2: testIdAttributes[1],
						3: { id: 3, walletId: 2, typeId: 3 }
					}
				});
			});
		});
		describe('Selectors', () => {
			beforeEach(() => {
				state.identity.attributes = [
					...testIdAttributes,
					{ id: 3, walletId: 2, typeId: 3 }
				].map(repo => repo.id);

				state.identity.attributesById = [
					...testIdAttributes,
					{ id: 3, walletId: 2, typeId: 3 }
				].reduce((acc, curr) => {
					acc[curr.id] = curr;
					return acc;
				}, {});
			});
			it('selectIdAttributes', () => {
				expect(identitySelectors.selectIdAttributes(state, testWalletId)).toEqual(
					testIdAttributes
				);
			});
		});
	});
});
