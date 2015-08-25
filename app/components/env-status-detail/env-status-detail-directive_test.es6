describe('EnvStatusDetail directive', () => {
    var elm,
        scope,
        controller;

    beforeEach(module('honeydew'));
    beforeEach(module('tpl'));

    beforeEach(inject( ($compile, $rootScope) => {
        elm = angular.element('<td env-status-detail name="name" app="app"></td>');

        scope = $rootScope;
        scope.app = fakeAppDetails();

        $compile(elm)(scope);
        scope.$digest();

        controller = elm.isolateScope().EnvStatusDetail;
    }));

    it('should pull the app and name down from its parent', () => {
        expect(controller.name).toBe('name');
        expect(controller.app).toBeDefined();
    });

    it('should know if the current app is Sharecare', () => {
        controller.name = 'name';
        expect(controller.isSharecare()).toBe(false);

        controller.name = 'SC';
        expect(controller.isSharecare()).toBe(true);
    });

    it('should display build information when available', () => {
        let text = elm.find('.build-detail').text();
        expect(text).toMatch(/branch: branch/);
        expect(text).toMatch(/build: build/);
    });

    it('should hide the build information when missing', () => {
        delete controller.app.build;
        scope.$digest();
        expect(elm.find('.build-detail').length).toBe(0);
    });

    it('should have an extra column for sharecare', () => {
        let notSC = ctrl.colspan();
        expect(notSC).toBe(4);

        ctrl.name = 'SC';
        expect(ctrl.colspan()).toBe(5);
    });

    it('should display healthcheck information', () => {
        // one healthcheck li for each of author, webpub, and data
        expect(elm.find('.healthcheck li').length).toBe(3);
    });

    describe('HD section', () => {

        beforeEach( () => {
            ctrl.app.honeydew = {
                success: 5,
                total: 10
            };

            scope.$digest();
        });

        it('should be displayed', () => {
            expect(elm.find('.honeydew').length).toBe(1);
        });

        it('should calculate the success percentage', () => {
            expect(ctrl.hdSuccessPercentage()).toBe(50);

            ctrl.app.honeydew = { success: 0, total: 0 };
            expect(ctrl.hdSuccessPercentage()).toBe(0);
        });

        it('should truncate the success percentage', () => {
            ctrl.app.honeydew = { success: 2, total: 3 };
            expect(ctrl.hdSuccessPercentage()).toBe(67);
        });

        it('should display the success percentage', () => {
            expect(elm.find('.honeydew .big-emph').text()).toMatch(/^\s+50\s+$/);
        });

        it('should display a dashboard link', () => {
            scope.$apply( () => { ctrl.app.honeydew.url = 'dashboard'; } );
            expect(elm.find('.honeydew a').attr('href')).toBe('dashboard');
        });

    });

    function fakeAppDetails ( healthcheck = {}, honeydew = {}, kabocha = { summary: true }) {
        let status = true;
        let webauth = { status };
        let webpub = { status };
        let data = { status };
        let build = { webpub: 'build', branch: 'branch' };

        healthcheck = angular.equals(healthcheck, {}) ? {
            webauth, webpub, data
        } : {};

        return { healthcheck, honeydew, kabocha, build };
    }
});
