angular.module('honeydew')
    .factory('CmDomHelpers', function ($location, $compile, autocomplete) {
        var factory = this;

        factory.focus = function (cm, $scope) {
            // for whatever reason, the dropdown
            // retains the open class when clicking into the
            // codemirror. Seems like CM swallows the click or
            // something; clicking on not CM parts of the page
            // hide the dropdown just fine.
            cm.on('focus', function (cm) {
                $scope.$apply( function () {
                    document.querySelectorAll('.file-nav-dropdown')[0]
                        .classList.remove('open');
                });
            });

        };

        factory.compileRenderedLines = function (cm, scope) {
            cm.on('renderLine', function (cm, line, elt) {
                // Phrases hijack the 'atom' token, and keywords
                // hijack the 'tag' token. These tokens are already
                // themed appropriately in each CodeMirror theme, so
                // they already look good and save us from having to
                // decide a color per theme or for all themes.
                var TOKENS = {
                    'clickable-link': 'null',
                    atom: 'phrase',
                    tag: 'keyword'
                };

                var foundTokens = false;

                Object.keys(TOKENS).forEach(function (token) {
                    var elementsWithTokens = elt.getElementsByClassName('cm-' + token);

                    if (elementsWithTokens.length) {
                        foundTokens = true;
                        if (TOKENS[token] === 'keyword') {
                            // We want keywords to show their value on
                            // mouseover
                            [].forEach.call(elementsWithTokens, function ( span ) {
                                var elemText = span.innerHTML;
                                var popoverOpts = {
                                    'popover': autocomplete.keywords[elemText],
                                    'popover-placement': 'right',
                                    'popover-trigger': 'mouseenter'
                                };

                                for (var key in popoverOpts) {
                                    span.setAttribute(key, popoverOpts[key]);
                                }
                            });
                        }
                    }

                });

                // We have a cmAtom directive that is restricted to
                // class. Compiling these spans will activate their
                // behavior.
                if (foundTokens) {
                    $compile(elt)(scope);
                }

            });
        };

        return factory;
    });
