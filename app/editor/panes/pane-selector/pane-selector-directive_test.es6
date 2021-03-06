describe('Pane Selector directive', () => {
    var elm,
        scope,
        compile,
        paneScope;

    beforeEach(module('honeydew'));
    beforeEach(module('tpl'));

    beforeEach(inject( ($compile, $rootScope, $localStorage, panes) => {
        elm = angular.element('<pane-selector></pane-selector');
        scope = $rootScope;
        compile = $compile;

        // initialize some localstorage settings for the various panes
        // to depend on
        $localStorage.settings = { theme: '' };

        compile(elm)(scope);
        scope.$digest();

        paneScope = elm.scope();
        paneScope.togglePaneWithScope(panes.panes[0]);
    }));

    it('should do repeat through the different panes', () => {
        var panes = elm.find('nav ul li');
        expect(panes.length).toBe(scope.panes.panes.length);
    });

    it('should reset a report status', () => {
        paneScope.report.failure = 'failure';
        scope.$apply( () => {
            scope.$broadcast('report:reset');
        });
        expect(paneScope.report.failure).toBe('');
        expect(elm.find('.active.failure').length).toBe(0);
    });

    it('should fail a report status', () => {
        paneScope.report.failure = '';
        scope.$apply( () => {
            scope.$broadcast('report:failure');
        });
        expect(paneScope.report.failure).toBe('failure');
        expect(elm.find('.active.failure').length).toBe(1);
    });
});
