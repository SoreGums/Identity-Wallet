'use strict';
const { Logger } = require('common/logger/logger');
const log = new Logger('SkUserInfoBoxDirective');
function SkUserInfoBoxDirective(
	$rootScope,
	$window,
	$timeout,
	$filter,
	SqlLiteService,
	RPCService,
	CommonService
) {
	'ngInject';

	return {
		restrict: 'E',
		scope: {},
		link: (scope, element) => {
			scope.userData = {
				email: '',
				name: '',
				country_of_residency: '',
				tempImage: $rootScope.appendStaticPath('assets/images/temp/avatar.jpg')
			};

			let idAttributeTypes = SqlLiteService.getIdAttributeTypes();

			scope.idAttributes = {};
			prepareData();

			scope.$on('sk-user-info-box:update', () => {
				prepareData();
			});

			scope.openDocumentAddEditModal = (event, idAttribute) => {
				let idAttributes = $rootScope.wallet.getIdAttributes();
				$rootScope.$broadcast(
					'id-attribute:open-document-add-dialog',
					idAttributes[idAttribute.key],
					idAttribute.key
				);
			};

			scope.getItemValue = item => {
				if (item.type === 'document' && item.documentName) {
					return 'Uploaded';
				}

				switch (item.key) {
					case 'birthdate':
						return $filter('date')(Number(item.data.value), 'yyyy/MM/dd');
					case 'work_place':
					case 'physical_address':
						let value = item.data.address1 + ', ';

						if (item.data.address2) {
							value += item.data.address2 + ', ';
						}

						value += item.data.city + ', ';
						value += item.data.region + ', ';
						value += item.data.zip + ', ';
						value += item.data.country;

						return value;
					case 'phonenumber_countrycode':
						return item.data.countryCode + ' ' + item.data.telephoneNumber;
					default:
						return item.data.value;
				}
			};

			function prepareData() {
				scope.idAttributes = {};

				let idAttributes = $rootScope.wallet.getIdAttributes();
				for (let i in idAttributes) {
					scope.idAttributes[i] = {
						key: i,
						type: idAttributeTypes[i].type,
						data: idAttributes[i].data,
						documentName: idAttributes[i].document && idAttributes[i].document.name
					};
				}
			}

			// profile picture start

			let updateProfilePictureStyles = profilePicture => {
				// binary
				if (profilePicture) {
					scope.profilePictureStyles = {
						'background-image': `url("data:image/gif;base64,${profilePicture}")`
					};
				}
			};

			updateProfilePictureStyles();

			RPCService.makeCall('getWalletProfilePicture', {
				id: $rootScope.wallet.id
			}).then(profilePicture => {
				updateProfilePictureStyles(profilePicture);
			});

			let updateWalletprofilePicture = profilePicture => {
				let data = {
					id: $rootScope.wallet.id,
					profilePicture: profilePicture
				};
				RPCService.makeCall('updateWalletprofilePicture', data)
					.then(res => {
						updateProfilePictureStyles(res.profilePicture);
					})
					.catch(err => {
						log.error(err);
						CommonService.showToast('error', 'Error while saving the file');
					});
			};

			scope.selectProfilePicture = event => {
				let fileSelect = RPCService.makeCall('openFileSelectDialog', {
					filters: [{ name: 'Documents', extensions: ['jpg', 'jpeg', 'png'] }],
					maxFileSize: 50 * 1000 * 1000
				});

				fileSelect
					.then(selectedFile => {
						if (!selectedFile) {
							return;
						}
						let profilePicture = selectedFile.buffer.toString('base64');
						updateWalletprofilePicture(profilePicture);
					})
					.catch(error => {
						log.error(error);
						CommonService.showToast(
							'error',
							'Maximum file size: The file could not be uploaded. The file exceeds the maximum upload size. Please upload file no larger than 50 MB.'
						);
					});
			};

			// profile picture  end
		},
		replace: true,
		templateUrl: 'common/directives/sk-user-info-box.html'
	};
}
SkUserInfoBoxDirective.$inject = [
	'$rootScope',

	'$window',
	'$timeout',
	'$filter',
	'SqlLiteService',
	'RPCService',
	'CommonService'
];
module.exports = SkUserInfoBoxDirective;
