'use strict';

angular.module('honeydew', [
    'ngResource',
    'ngSanitize',
    'ngStorage',
    'ngGrid',
    'ui.codemirror',
    'ui.bootstrap',
    'ui.router',
    'doowb.angular-pusher',
    'treeControl',
    'ui.select',


    // internal modules
    'config',
    'sc.constants',
    'sc.hostname',
    'sc.cmmodes'
])
    .config(function ($stateProvider, $urlRouterProvider) {
        (function setLocationFromURL() {
            var url = window.location.search;

            if (url.search(/\?\/.*\.feature$/) != -1) {
                var featureName = url.slice(2);
                window.location.href = '/#/features/' + featureName;
            }

            if (url.search(/\?\/.*\.set$/) != -1) {
                var setName = url.slice(2);
                window.location.href = '/#/sets/' + setName;
            }
        })();

        // we used to store an unnecessarily large amount of data in
        // the setsAsJSON cookie, and it would be sent with every
        // single request, even backend ones. Let's stop doing that.
        document.cookie = 'setsAsJSON=; expires=Thu, 01-Jan-70 00:00:01 GMT;';

        var defaultPath = '/';
        $urlRouterProvider.otherwise(defaultPath);

        var setTitleAndHistory = [
            '$rootScope', '$location', '$localStorage', '$stateParams',
            function ($rootScope, $location, $localStorage, $stateParams) {
                if ($stateParams.path || $stateParams.set) {
                    $rootScope.title = $location.path().split('/').pop();
                }
                else {
                    $rootScope.title = 'Honeydew: Home';
                }
            }];

        $stateProvider
            .state('editor', {
                abstract: true,
                templateUrl: 'components/filetree/filetree.html',
                controller: 'FileTreeCtrl'
            })
            .state('editor.landing', {
                url: '/',
                templateUrl: 'landing/landing.html',
                controller: 'LandingCtrl',
                onEnter: setTitleAndHistory
            })
            .state('editor.features', {
                url: '^/{path:.*\.(?:feature|phrase)}',
                templateUrl: 'editor/editor.html',
                controller: 'EditorCtrl',
                onEnter: setTitleAndHistory
            })
            .state('editor.sets', {
                url: '/sets/:set',
                templateUrl: 'set/set.html',
                controller: 'SetCtrl',
                onEnter: setTitleAndHistory
            })
            .state('monitor', {
                url: '/monitor',
                templateUrl: 'monitor/monitor.html',
                controller: 'MonitorCtrl',
                onEnter: ['$rootScope', function ($rootScope) {
                    $rootScope.title = 'HD Monitors';
                }]
            })
            .state('screenshot', {
                url: '/screenshot/:screenshot',
                templateUrl: 'screenshot/screenshot.html',
                controller: 'ScreenshotCtrl',
                onEnter: ['$rootScope', function ($rootScope) {
                    $rootScope.title = 'HD Screenshots';
                }]
            });
    })
    .config(function(pusherConfig, PusherServiceProvider) {
        // pusherToken is globally defined in app/config.js
        PusherServiceProvider
            .setToken(pusherConfig.pusher_auth_key)
            .setOptions({
                authEndpoint: '/rest.php/pusher/auth'
            });
    });