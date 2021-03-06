angular.module('honeydew')
    .service('panes', function ($compile, $rootScope, $stateParams) {
        var base = '/editor/panes/';
        var panes = [
                {
                    name: 'report',
                    classes: 'col-md-6',
                    template: '<live-report></live-report>',
                    icon: 'fa-list-alt',
                    tooltip: 'Live Report',
                    include: false
                },
                {
                    name: 'samples',
                    classes: 'col-md-3',
                    templateUrl: base + 'examples/examples.html',
                    icon: 'fa-clipboard',
                    tooltip: 'Samples',
                    include: true
                },
                {
                    name: 'rules',
                    classes: 'col-md-3',
                    templateUrl: base + 'rules/rules.html',
                    icon: 'fa-file-text-o',
                    tooltip: 'All Rules',
                    include: true
                },
                {
                    name: 'settings',
                    classes: 'col-md-3',
                    template: '<editor-settings options="editorOptions"></editor-settings>',
                    icon: 'fa-gear',
                    tooltip: 'Settings',
                    include: false
                },
                {
                    name: 'help',
                    classes: 'col-md-4',
                    template: '<editor-help options="editorOptions" map="doc.keyMap"></editor-help>',
                    icon: 'fa-question-circle',
                    tooltip: 'Help',
                    include: false
                }
        ];

        var phraseInfo = {
            name: 'phrase',
            classes: 'col-md-4',
            template: '<div data-phrase-info></div',
            icon: 'fa-plus-square-o',
            tooltip: 'Phrase Information',
            include: false
        };
        var hasPhraseInfo = function () {
            return panes[panes.length - 1].name === phraseInfo.name;
        };


        var resolveOptionalIcons = function (path) {
            if (path && path.match(/phrases.*\.phrase$/)) {
                if ( ! hasPhraseInfo() ) {
                    panes.push(phraseInfo);
                }
            }
            else {
                if ( hasPhraseInfo() ) {
                    panes.pop();
                }
            }
        };

        resolveOptionalIcons($stateParams.path || '');
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            resolveOptionalIcons(toParams.path);
        });

        return {
            panes: panes,

            activePane: '',

            openPane:  function (pane, contents) {
                var panes = this;
                if (this.activePane === pane || this.activePane === pane.name) {
                    console.log('already open');
                }
                else {
                    if (typeof(pane) === 'object') {
                        this.activePane = pane.name;

                        if (pane.include) {
                            this.url = pane.templateUrl;
                        }
                        else {
                            if (typeof(contents) === 'undefined') {
                                contents = $compile( pane.template )( $rootScope );
                            }
                            $('.center-panel.' + pane.name).html(contents);
                        }
                    }
                    else {
                        this.panes.forEach( function (paneObject) {
                            if (paneObject.name === pane) {
                                panes.openPane(paneObject);
                            }
                        });
                    }
                }
            },

            closePane:  function () {
                this.activePane = '';
                this.url = '';
            },

            togglePane:  function (pane, contents) {
                if (this.activePane === pane.name) {
                    this.closePane();
                }
                else {
                    this.openPane(pane, contents);
                }
            }
        };
    });
