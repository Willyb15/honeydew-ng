angular.module('honeydew')
    .service('HoneydewJob', function ($resource, $location, $sessionStorage, hostname, liveReport) {
        class HoneydewJob {
            constructor( properties ) {
                for (var prop in properties) {
                    this[prop] = properties[prop];
                }

                this.file = this.file || $location.path().substr(1);
                this.host = this.host || hostname.host;
                this.channel = this.channel || liveReport.switchChannel();

                this.browser = this._decoratedBrowser();
                if ( ! this._isSaucelabs() ) {
                    this.local = this._wdServerAddress();
                }

                this.payload = new (HoneydewJob.backend())( this );
            }

            $execute() {
                this.payload.$execute();
            }

            _decoratedBrowser() {
                var b = [
                    this._serverPrefix(),
                    this.browser,
                    this._browserSuffix()
                ].join(' ');

                // Browser is passed as an array because the backend
                // knows how to handle more than once browser at once.
                return [ b.trim() ];
            }

            _isSaucelabs() {
                return this.server === 'Saucelabs';
            }

            _browserSuffix() {
                return this._isSaucelabs() ? '' : 'Local';
            }

            _serverPrefix() {
                var matches = this.server.match(/^(..): (.*)/);
                return matches ? matches[1] : '';
            }

            _wdServerAddress() {
                $sessionStorage.settings = $sessionStorage.settings || {};
                if ( this.server === 'Localhost' && 'wdAddress' in $sessionStorage.settings){
                    return $sessionStorage.settings.wdAddress;
                }
                else {
                    return this.server.split(' ').pop();
                }

                var matches = this.server.match(/^(..): (.*)/);
                return matches ? matches[2] : '';
            }

            static backend() {
                return $resource('/rest.php/jobs', null, {
                    'execute': {
                        method: 'POST'
                    }
                });
            }
        }

        return HoneydewJob;
    });
