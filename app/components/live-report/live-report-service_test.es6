describe('LiveReportService', function () {
    var liveReportService, rootScope, pusherMock, timeout, pusherReal;
    var channel = 'testChannel';
    var rule = 'Given I am on the / page';
    beforeEach(module('honeydew'));

    beforeEach(inject(function ($rootScope, _liveReport_, _Pusher_, $timeout, _cmReportMode_) {
        liveReportService = _liveReport_;
        pusherMock = pusherReal = _Pusher_;
        rootScope = $rootScope;

        pusherMock.channel = {
            trigger: function () {}
        };
        spyOn(pusherMock.channel, 'trigger');

        timeout = $timeout;
        spyOn(pusherMock, 'subscribe').and.callFake(function (params) {
            return {
                then: function (cb) {
                    cb(pusherMock.channel);
                }
            };
        });

        spyOn(pusherMock, 'unsubscribe');

        spyOn(liveReportService, 'close').and.callThrough();
    }));

    afterEach( function () {
        liveReportService.close.calls.reset();
    });

    it('can be instantiated', function () {
        expect(liveReportService).toBeDefined();
    });

    it('gives us new private channels', function () {
        var channel = liveReportService.switchChannel();
        expect(channel).toMatch(/^private\-/);
    });

    it('switches channels', function () {
        liveReportService.switchChannel(channel);
        expect(liveReportService.channel).toMatch(channel);
    });

    it('should update the report in scope on pusher updates', function () {
        liveReportService.switchChannel(channel);
        expect(liveReportService.current).toMatch('Loading...');
    });

    it('should append new messages to the output', function () {
        liveReportService.pusherListener(rule);
        expect(liveReportService.output[0]).toBe(rule);

        liveReportService.pusherListener(rule);
        expect(liveReportService.output[1]).toBe(rule);
    });

    it('should append new current-rules to the current prop', () => {
        var current = `#### ${rule}`;
        liveReportService.pusherListener(current);
        expect(liveReportService.current).toContain(current);
        expect(liveReportService.output).not.toContain(current);

        liveReportService.pusherListener(current);
        expect(liveReportService.current).toBe(current + current);
    });

    it('should clear the current rules when a log rule comes in', () => {
        var current = `#### ${rule}`;
        liveReportService.pusherListener(current);
        liveReportService.pusherListener(rule);

        expect(liveReportService.current).toBe('');
        expect(liveReportService.output[0]).toBe(rule);
    });

    it('should keep track current and output simultaneously', () => {
        var current = `#### ${rule}`;
        liveReportService.pusherListener(current);
        liveReportService.pusherListener(rule);
        liveReportService.pusherListener(current);

        expect(liveReportService.current).toBe(current);
        expect(liveReportService.output[0]).toBe(rule);
    });

    it('should broadcast an event about a failed test', () => {
        var failed = '# (ER)  (100)   Given',
            emits = 0;
        rootScope.$on('report:failure', () => emits++);

        liveReportService.pusherListener(failed);
        expect(emits).toBe(1);
    });

    it('should broadcast an event about the end of a test', () => {
         var ended = 'End Date: 123456789',
            emits = 0;
        rootScope.$on('report:ended', () => emits++);

        liveReportService.pusherListener(ended);
        expect(emits).toBe(1);
    });

    it('sends messages in private channels', function () {
        liveReportService.switchChannel();
        liveReportService.evalRule(rule);
        expect(pusherMock.channel.trigger).toHaveBeenCalledWith(liveReportService.events.evalRule, rule);
    });

    it('closes itself if we join a new channel and immediately idle', function () {
        liveReportService.switchChannel();
        expect(liveReportService.close).toHaveBeenCalled();
        timeout.flush();
        expect(liveReportService.close.calls.count()).toBe(2);
    });

    it('can we idle after evaluating a rule', function () {
        liveReportService.switchChannel();
        liveReportService.evalRule('blah blah blah');
        liveReportService.close.calls.reset();
        timeout.flush();
        expect(liveReportService.close.calls.count()).toBe(1);
        expect(liveReportService.close).toHaveBeenCalled();
    });

});
