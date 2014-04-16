'use strict';

angular.module('honeydew')
    .service('hostname', function ($rootScope) {
        var hostnameService = {
            host: 'https://www.sharecare.com',
            env: 'stage',
            app: 'SC',

            envs: {
                SC: ['al', 'cm', 'dw', 'stage', 'prod'],
                DROZ: ['qa', 'stage', 'prod'],
                DS: ['qa', 'stage', 'prod']
            },

            apps: {
                SC: 'sharecare.com',
                DROZ: 'doctoroz.com',
                DS: 'dailystrength.org'
            },

            envOptions: [],
            appOptions: [],

            resolve: function () {
                var q = this.env === 'prod' ? '' : '.';
                var literalEnv = this.env === 'prod' ? '' : this.env;
                this.host = 'https://www.' + literalEnv + q + this.apps[this.app];
            }
        };

        $rootScope.$watch(function() {
            return hostnameService.env;
        }, function (newValue, oldValue) {
            hostnameService.resolve();
        });

        $rootScope.$watch(function() {
            return hostnameService.app;
        }, function () {
            var app = hostnameService.app;
            hostnameService.envOptions = hostnameService.envs[app];
            hostnameService.resolve();
        });

        hostnameService.appOptions = Object.keys(hostnameService.apps);
        hostnameService.envOptions = ['qa', 'stage', 'prod'];

        return hostnameService;
    });
