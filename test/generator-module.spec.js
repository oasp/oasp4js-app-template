'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var fs = require('fs-extra');
var oaspGenTestUtils = require('./app-suite-testcases/oasp-generator-test-utils');
var mkdirp = require('mkdirp');

describe('oasp:module', function () {

    var runModuleGenerator = function (directory, argument, done) {
        mkdirp.sync(directory);
        process.chdir(directory);
        helpers.run(path.join(__dirname, '../module'), {tmpdir: false})
            .withArguments(argument)
            .withOptions({ 'skip-install': true })
            .on('end', done);
    };

    var executeTestCase = function (testcase, appPath) {

        describe(testcase, function () {
            before(function (done) {
                helpers.testDirectory(oaspGenTestUtils.testDirectory, function () {
                    fs.copy(path.join(__dirname, 'generator-templates/' + testcase), oaspGenTestUtils.testDirectory, done);
                });
            });


            describe('calling generator in main directory', function () {

                before(runModuleGenerator.bind(null, oaspGenTestUtils.testDirectory, 'new-module'));

                it('creates files', function () {
                    assert.file([
                            appPath + '/new-module/new-module.module.js',
                            appPath + '/new-module/new-module.less'
                    ]);
                });

                it('links crated module into app module', function () {
                    assert.fileContent(appPath + '/new-module/new-module.module.js', 'angular.module(\'app.newModule\', [])');
                    assert.fileContent(appPath + '/app.module.js', /angular\.module\(.*\[.*'app\.newModule'.*\]/);
                });
            });

            describe('calling generator in existing module directory directory', function () {

                before(runModuleGenerator.bind(null, path.join(oaspGenTestUtils.testDirectory, appPath + '/component-1'), 'subComponent1'));

                it('creates files', function () {
                    assert.file([
                            appPath + '/component-1/sub-component1/sub-component1.module.js',
                            appPath + '/component-1/sub-component1/sub-component1.less'
                    ]);
                });

                it('links crated module into app module', function () {
                    assert.fileContent(appPath + '/component-1/sub-component1/sub-component1.module.js', 'angular.module(\'app.component1.subComponent1\', [])');
                    assert.fileContent(appPath + '/component-1/component-1.module.js', /angular\.module\(.*\[.*'app\.component1\.subComponent1'.*\]/);
                });
            });

            describe('calling generator in subdirectory', function () {

                before(runModuleGenerator.bind(null, path.join(oaspGenTestUtils.testDirectory, appPath + '/component-1/sub-1/sub-2'), 'subComponent2'));

                it('creates files', function () {
                    assert.file([
                            appPath + '/component-1/sub-1/sub-2/sub-component2/sub-component2.module.js',
                            appPath + '/component-1/sub-1/sub-2/sub-component2/sub-component2.less'
                    ]);
                });

                it('links crated module into app module', function () {
                    assert.fileContent(appPath + '/component-1/sub-1/sub-2/sub-component2/sub-component2.module.js', 'angular.module(\'app.component1.subComponent2\', [])');
                    assert.fileContent(appPath + '/component-1/component-1.module.js', /angular\.module\(.*\[.*'app\.component1\.subComponent2'.*\]/);
                });
            });
        });
    };
    executeTestCase('test-case-2', 'src');
    executeTestCase('test-case-1', 'app');
});
