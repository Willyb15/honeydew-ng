/**
 * Brian Woodward
 *
 * Brian Woodward <http://github.com/doowb>
 * Created and maintained by Brian Woodward
 *
 * Copyright (c) 2014 Brian Woodward.
 * Licensed under the MIT License (MIT).
 */

/**
 * This code and some of the ideas in the code are inspired by the following
 * article from "25 days of AngularJS Calendar | 2013"
 * http://www.ng-newsletter.com/advent2013/#!/day/17
 */

'use strict';

angular.module('doowb.angular-pusher', [])

// create a provider that loads the pusher script from a cdn
.provider('PusherService', function () {
  var scriptUrl = '//d3dy5gmtp8yhk7.cloudfront.net/2.2.0-rc3/pusher.min.js';
  var scriptId = 'pusher-sdk';
  var apiKey = '';
  var initOptions = {};

  this.setPusherUrl = function (url) {
    scriptUrl = url || scriptUrl;
    return this;
  };

  this.setOptions = function (options) {
    initOptions = options || initOptions;
    return this;
  };

  this.setToken = function (token) {
    apiKey = token || apiKey;
    return this;
  };

  // load the pusher api script async
  function createScript ($document, callback, success) {
    var tag = $document.createElement('script');
    tag.type = 'text/javascript';
    tag.async = true;
    tag.id = scriptId;
    tag.src = scriptUrl;

    tag.onreadystatechange = tag.onload = function () {
      var state = tag.readState;
      if (!callback.done && (!state || /loaded|complete/.test(state))) {
        callback.done = true;
        callback();
      }
    };

    $document.getElementsByTagName('head')[0].appendChild(tag);
  }

  this.$get = ['$document', '$timeout', '$q', '$rootScope', '$window',
    function ($document, $timeout, $q, $rootScope, $window) {
      var deferred = $q.defer();
      var socket;
      var pusher;

      function onSuccess () {
        pusher = new $window.Pusher(apiKey, initOptions);
      }

      var onScriptLoad = function (callback) {
        onSuccess();
        $timeout(function () {
          deferred.resolve(pusher);
        });
      };

      createScript($document[0], onScriptLoad);
      return deferred.promise;
    }];

})

.factory('Pusher', ['$rootScope', 'PusherService',
  function ($rootScope, PusherService) {
    var factory = {

      subscribe: function (channelName, eventName, callback) {
        return PusherService.then(function (pusher) {
            var channel = pusher.channel(channelName) || pusher.subscribe(channelName);

            channel.bind(eventName, function (data) {
                if (callback) callback(data);
                $rootScope.$broadcast(channelName + ':' + eventName, data);
                $rootScope.$digest();
            });

            return channel;
        });
      },

      unsubscribe: function (channelName) {
        PusherService.then(function (pusher) {
          pusher.unsubscribe(channelName);
        });
      }
    };

    return factory;
  }
]);