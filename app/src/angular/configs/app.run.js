'use strict';

//import $ from 'jquery';

import Wallet from '../classes/wallet';
import Token from '../classes/token';

function AppRun($rootScope, $log, $window, $timeout, $interval, $state, $mdDialog, DICTIONARY, CONFIG, ElectronService, ConfigFileService, Web3Service) {
    'ngInject';

    $rootScope.selectedLanguage = "en";

    $log.debug('DICTIONARY', DICTIONARY);

    /**
     * 
     */
    $rootScope.INITIAL_ID_ATTRIBUTES = CONFIG.constants.initialIdAttributes;
    $rootScope.LOCAL_STORAGE_KEYS = CONFIG.constants.localStorageKeys;
    $rootScope.PRIMARY_TOKEN = CONFIG.constants.primaryToken;
    $rootScope.DICTIONARY = DICTIONARY[$rootScope.selectedLanguage];

    /**
     * TODO - remove
     */
    //$rootScope.ethUsdPrice = 1195;
    //$rootScope.keyUsdPrice = 0.015;

    $rootScope.PRICES = {};

    /**
     * 
     */
    Wallet.$rootScope = $rootScope;
    Token.$rootScope = $rootScope;

    /**
     * 
     */
    $rootScope.getTranslation = function (prefix, keyword, args) {
        if (prefix) {
            keyword = prefix.toUpperCase() + "_" + keyword.toUpperCase();
        }

        let template = DICTIONARY[$rootScope.selectedLanguage][keyword] || 'translation not found';
        if (args) {
            for (let i = 0; i < args.length; i++) {
                template = template.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
            }
        }
        return template;
    }

    $rootScope.buildErrorObject = (keyword, error) => {
        return {
            message: $rootScope.getTranslation(keyword),
            causedBy: error
        }
    }

    $rootScope.closeApp = (event) => {
        ElectronService.closeApp();
    }

    $rootScope.openInBrowser = function (url, useInAppBrowser) {
        useInAppBrowser ? $window.open(url) : ElectronService.openBrowserWindow(url);
    }

    $rootScope.openSendTokenDialog = (event, symbol) => {
        return $mdDialog.show({
            controller: 'SendTokenDialogController',
            templateUrl: 'common/dialogs/send-token.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: false,
            fullscreen: true,
            escapeToClose: false,
            locals: {
                args: {
                    symbol: symbol
                }
            }
        });
    }

    $rootScope.openReceiveTokenDialog = (event, args) => {
        return $mdDialog.show({
            controller: 'ReceiveTokenDialogController',
            templateUrl: 'common/dialogs/receive-token.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: false,
            fullscreen: true,
            locals: {
                args: args
            }
        });
    }

    $rootScope.checkTermsAndConditions = () => {
        let store = ConfigFileService.getStore();
        let termsAccepted = store.setup ? store.setup.termsAccepted : false;
        if (!termsAccepted) {
            $timeout(() => {
                $mdDialog.show({
                    controller: 'TermsDialogController',
                    templateUrl: 'common/dialogs/terms.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose: false,
                    escapeToClose: false,
                    fullscreen: true,
                }).then(() => {
                    $mdDialog.show({
                        controller: 'StartupGuideDialogController',
                        templateUrl: 'common/dialogs/startup-guide.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose: false,
                        escapeToClose: false,
                        fullscreen: true,
                    })
                });
            }, 300);
        }
    };

    $rootScope.openAddCustomTokenDialog = (event) => {
        return $mdDialog.show({
            controller: 'AddCustomTokenDialogController',
            templateUrl: 'common/dialogs/add-custom-token.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: false,
            fullscreen: true
        });
    }

    /**
     * 
     */
    $rootScope.$on('local-storage:change', (event, data) => {
        $log.info('local-storage:change', data);
        if (ElectronService.ipcRenderer) {
            ElectronService.sendConfigChange(data);
        }
    });

    /**
     * Descmetrics Event
     */
    // ElectronService.analytics('app-start', new Date().toISOString());
}

export default AppRun;
