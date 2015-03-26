function cmReportModeService ($rootScope, preambleOptions) {
    var style = {
        HEADER: 'cm-keyword',
        SUCCESS: 'success',
        FAILURE: 'failure',
        SCENARIO: 'scenario',
        LINK: 'link',

        successfulScenario () {
            return this.SUCCESS + ' ' + this.SCENARIO;
        },

        failedScenario () {
            return this.FAILURE + ' ' + this.SCENARIO;
        },

        highlight (line) {
            var elem = '';
            var ret = CodeMirror.runMode(line, 'report', (token, style) => {
                if (style) {
                    var outputToken;
                    if (style === 'link') {
                        outputToken = token.replace(/(\d+)/, '<a href="/#/report/$1">$1</a>');
                    }
                    else {
                        outputToken = token;
                    }

                    elem += '<span class="' + style + '">' + outputToken + '</span>';

                    if (style === 'failure') {
                        $rootScope.$broadcast('report:failure');
                    }
                }
                else {
                    elem += token;
                }
            });

            return elem;
        }
    };

    CodeMirror.defineMode('report', function () {
        var preambleKeys = Object.keys(preambleOptions);
        var headers = new RegExp([
            'Start Date',
            'Host',
            'Build',
            'Browser',
            'Feature File',
            'Job ID',
            'Feature',
        ].concat(preambleKeys).map(it => it + ':').join('|'));

        var successRule = /# \(OK\).*?\)/;
        var failureRule = /# \(ER\).*?\)/;

        return {
            startState: () => { return {}; },
            token: (stream, state) => {
                if (stream.match(headers)) {
                    return style.HEADER;
                }
                else if (stream.match(successRule)) {
                    return style.SUCCESS;
                }
                else if (stream.match(failureRule)) {
                    return style.FAILURE;
                }
                else if (stream.match(/# Success/)) {
                    return style.successfulScenario();
                }
                else if (stream.match(/# Failure/)) {
                    return style.failedScenario();
                }
                else if (stream.match(/Report ID: \d+/)) {
                    return style.LINK;
                }
                else {
                    stream.next();
                    stream.eatWhile(/[^\s]/);
                    return null;
                }
            }
        };
    });

    return style;
}

angular.module('sc.cmmodes', [ 'sc.constants' ]).service('cmReportMode', cmReportModeService);
