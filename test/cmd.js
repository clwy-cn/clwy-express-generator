
var assert = require('assert')
var AppRunner = require('./support/app-runner')
var exec = require('child_process').exec
var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var request = require('supertest')
var rimraf = require('rimraf')
var spawn = require('child_process').spawn
var utils = require('./support/utils')
var validateNpmName = require('validate-npm-package-name')

var APP_START_STOP_TIMEOUT = 10000
var PKG_PATH = path.resolve(__dirname, '..', 'package.json')
var BIN_PATH = path.resolve(path.dirname(PKG_PATH), require(PKG_PATH).bin.express)
var NPM_INSTALL_TIMEOUT = 300000 // 5 minutes
var STDERR_MAX_BUFFER = 5 * 1024 * 1024 // 5mb
var TEMP_DIR = utils.tmpDir()
var MIN_ES6_VERSION = 14

describe('express(1)', function () {
  after(function (done) {
    this.timeout(30000)
    rimraf(TEMP_DIR, done)
  })

  describe('(no args)', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should create basic app', function (done) {
      run(ctx.dir, [], function (err, stdout, warnings) {
        if (err) return done(err)
        ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
        ctx.stdout = stdout
        ctx.warnings = warnings
        assert.strictEqual(ctx.files.length, 16)
        done()
      })
    })

    it('should print jade view warning', function () {
      assert.ok(ctx.warnings.some(function (warn) {
        return warn === 'the default view engine will not be jade in future releases\nuse `--view=jade\' or `--help\' for additional options'
      }))
    })

    it('should provide debug instructions', function () {
      assert.ok(/DEBUG=express-1-no-args:\* (?:& )?npm start/.test(ctx.stdout))
    })

    it('should have basic files', function () {
      assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1)
      assert.notStrictEqual(ctx.files.indexOf('app.js'), -1)
      assert.notStrictEqual(ctx.files.indexOf('package.json'), -1)
    })

    it('should have jade templates', function () {
      assert.notStrictEqual(ctx.files.indexOf('views/error.jade'), -1)
      assert.notStrictEqual(ctx.files.indexOf('views/index.jade'), -1)
      assert.notStrictEqual(ctx.files.indexOf('views/layout.jade'), -1)
    })

    it('should have a package.json file', function () {
      var file = path.resolve(ctx.dir, 'package.json')
      var contents = fs.readFileSync(file, 'utf8')
      assert.strictEqual(contents, '{\n' +
        '  "name": "express-1-no-args",\n' +
        '  "version": "0.0.0",\n' +
        '  "private": true,\n' +
        '  "scripts": {\n' +
        '    "start": "node ./bin/www"\n' +
        '  },\n' +
        '  "dependencies": {\n' +
        '    "cookie-parser": "~1.4.5",\n' +
        '    "debug": "~2.6.9",\n' +
        '    "express": "~4.17.1",\n' +
        '    "http-errors": "~1.7.2",\n' +
        '    "jade": "~1.11.0",\n' +
        '    "morgan": "~1.10.0"\n' +
        '  }\n' +
        '}\n')
    })

    it('should have installable dependencies', function (done) {
      this.timeout(NPM_INSTALL_TIMEOUT)
      npmInstall(ctx.dir, done)
    })

    it('should export an express app from app.js', function () {
      var file = path.resolve(ctx.dir, 'app.js')
      var app = require(file)
      assert.strictEqual(typeof app, 'function')
      assert.strictEqual(typeof app.handle, 'function')
    })

    describe('npm start', function () {
      before('start app', function () {
        this.app = new AppRunner(ctx.dir)
      })

      after('stop app', function (done) {
        this.timeout(APP_START_STOP_TIMEOUT)
        this.app.stop(done)
      })

      it('should start app', function (done) {
        this.timeout(APP_START_STOP_TIMEOUT)
        this.app.start(done)
      })

      it('should respond to HTTP request', function (done) {
        request(this.app)
          .get('/')
          .expect(200, /<title>Express<\/title>/, done)
      })

      it('should generate a 404', function (done) {
        request(this.app)
          .get('/does_not_exist')
          .expect(404, /<h1>Not Found<\/h1>/, done)
      })
    })

    describe('when directory contains spaces', function () {
      var ctx0 = setupTestEnvironment('foo bar (BAZ!)')

      it('should create basic app', function (done) {
        run(ctx0.dir, [], function (err, output) {
          if (err) return done(err)
          assert.strictEqual(utils.parseCreatedFiles(output, ctx0.dir).length, 16)
          done()
        })
      })

      it('should have a valid npm package name', function () {
        var file = path.resolve(ctx0.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var name = JSON.parse(contents).name
        assert.ok(validateNpmName(name).validForNewPackages, 'package name "' + name + '" is valid')
        assert.strictEqual(name, 'foo-bar-baz')
      })
    })

    describe('when directory is not a valid name', function () {
      var ctx1 = setupTestEnvironment('_')

      it('should create basic app', function (done) {
        run(ctx1.dir, [], function (err, output) {
          if (err) return done(err)
          assert.strictEqual(utils.parseCreatedFiles(output, ctx1.dir).length, 16)
          done()
        })
      })

      it('should default to name "hello-world"', function () {
        var file = path.resolve(ctx1.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var name = JSON.parse(contents).name
        assert.ok(validateNpmName(name).validForNewPackages)
        assert.strictEqual(name, 'hello-world')
      })
    })
  })

  describe('(unknown args)', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should exit with code 1', function (done) {
      runRaw(ctx.dir, ['--foo'], function (err, code, stdout, stderr) {
        if (err) return done(err)
        assert.strictEqual(code, 1)
        done()
      })
    })

    it('should print usage', function (done) {
      runRaw(ctx.dir, ['--foo'], function (err, code, stdout, stderr) {
        if (err) return done(err)
        assert.ok(/Usage: express /.test(stdout))
        assert.ok(/--help/.test(stdout))
        assert.ok(/--version/.test(stdout))
        assert.ok(/error: unknown option/.test(stderr))
        done()
      })
    })

    it('should print unknown option', function (done) {
      runRaw(ctx.dir, ['--foo'], function (err, code, stdout, stderr) {
        if (err) return done(err)
        assert.ok(/error: unknown option/.test(stderr))
        done()
      })
    })
  })

  describe('<dir>', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should create basic app in directory', function (done) {
      runRaw(ctx.dir, ['foo'], function (err, code, stdout, stderr) {
        if (err) return done(err)
        ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
        ctx.stderr = stderr
        ctx.stdout = stdout
        assert.strictEqual(ctx.files.length, 17)
        done()
      })
    })

    it('should provide change directory instructions', function () {
      assert.ok(/cd foo/.test(ctx.stdout))
    })

    it('should provide install instructions', function () {
      assert.ok(/npm install/.test(ctx.stdout))
    })

    it('should provide debug instructions', function () {
      assert.ok(/DEBUG=foo:\* (?:& )?npm start/.test(ctx.stdout))
    })

    it('should have basic files', function () {
      assert.notStrictEqual(ctx.files.indexOf('foo/bin/www'), -1)
      assert.notStrictEqual(ctx.files.indexOf('foo/app.js'), -1)
      assert.notStrictEqual(ctx.files.indexOf('foo/package.json'), -1)
    })

    it('should have jade templates', function () {
      assert.notStrictEqual(ctx.files.indexOf('foo/views/error.jade'), -1)
      assert.notStrictEqual(ctx.files.indexOf('foo/views/index.jade'), -1)
      assert.notStrictEqual(ctx.files.indexOf('foo/views/layout.jade'), -1)
    })
  })

  describe('--css <engine>', function () {
    describe('(no engine)', function () {
      var ctx = setupTestEnvironment(this.fullTitle())

      it('should exit with code 1', function (done) {
        runRaw(ctx.dir, ['--css'], function (err, code, stdout, stderr) {
          if (err) return done(err)
          assert.strictEqual(code, 1)
          done()
        })
      })

      it('should print usage', function (done) {
        runRaw(ctx.dir, ['--css'], function (err, code, stdout) {
          if (err) return done(err)
          assert.ok(/Usage: express /.test(stdout))
          assert.ok(/--help/.test(stdout))
          assert.ok(/--version/.test(stdout))
          done()
        })
      })

      it('should print argument missing', function (done) {
        runRaw(ctx.dir, ['--css'], function (err, code, stdout, stderr) {
          if (err) return done(err)
          assert.ok(/error: option .* argument missing/.test(stderr))
          done()
        })
      })
    })

    describe('less', function () {
      var ctx = setupTestEnvironment(this.fullTitle())

      it('should create basic app with less files', function (done) {
        run(ctx.dir, ['--css', 'less'], function (err, stdout) {
          if (err) return done(err)
          ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
          assert.strictEqual(ctx.files.length, 16, 'should have 16 files')
          done()
        })
      })

      it('should have basic files', function () {
        assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1, 'should have bin/www file')
        assert.notStrictEqual(ctx.files.indexOf('app.js'), -1, 'should have app.js file')
        assert.notStrictEqual(ctx.files.indexOf('package.json'), -1, 'should have package.json file')
      })

      it('should have less files', function () {
        assert.notStrictEqual(ctx.files.indexOf('public/stylesheets/style.less'), -1, 'should have style.less file')
      })

      it('should have less-middleware in package dependencies', function () {
        var file = path.resolve(ctx.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var pkg = JSON.parse(contents)
        assert.strictEqual(typeof pkg.dependencies['less-middleware'], 'string')
      })

      it('should have installable dependencies', function (done) {
        this.timeout(NPM_INSTALL_TIMEOUT)
        npmInstall(ctx.dir, done)
      })

      describe('npm start', function () {
        before('start app', function () {
          this.app = new AppRunner(ctx.dir)
        })

        after('stop app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.stop(done)
        })

        it('should start app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.start(done)
        })

        it('should respond to HTTP request', function (done) {
          request(this.app)
            .get('/')
            .expect(200, /<title>Express<\/title>/, done)
        })

        it('should respond with stylesheet', function (done) {
          request(this.app)
            .get('/stylesheets/style.css')
            .expect(200, /sans-serif/, done)
        })
      })
    })

    describe('sass', function () {
      var ctx = setupTestEnvironment(this.fullTitle())

      it('should create basic app with sass files', function (done) {
        run(ctx.dir, ['--css', 'sass'], function (err, stdout) {
          if (err) return done(err)
          ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
          assert.strictEqual(ctx.files.length, 16, 'should have 16 files')
          done()
        })
      })

      it('should have basic files', function () {
        assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1, 'should have bin/www file')
        assert.notStrictEqual(ctx.files.indexOf('app.js'), -1, 'should have app.js file')
        assert.notStrictEqual(ctx.files.indexOf('package.json'), -1, 'should have package.json file')
      })

      it('should have sass files', function () {
        assert.notStrictEqual(ctx.files.indexOf('public/stylesheets/style.sass'), -1, 'should have style.sass file')
      })

      it('should have node-sass-middleware in package dependencies', function () {
        var file = path.resolve(ctx.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var pkg = JSON.parse(contents)
        assert.strictEqual(typeof pkg.dependencies['node-sass-middleware'], 'string')
      })

      it('should have installable dependencies', function (done) {
        this.timeout(NPM_INSTALL_TIMEOUT)
        npmInstall(ctx.dir, done)
      })

      describe('npm start', function () {
        before('start app', function () {
          this.app = new AppRunner(ctx.dir)
        })

        after('stop app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.stop(done)
        })

        it('should start app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.start(done)
        })

        it('should respond to HTTP request', function (done) {
          request(this.app)
            .get('/')
            .expect(200, /<title>Express<\/title>/, done)
        })

        it('should respond with stylesheet', function (done) {
          request(this.app)
            .get('/stylesheets/style.css')
            .expect(200, /sans-serif/, done)
        })
      })
    })

    describe('stylus', function () {
      var ctx = setupTestEnvironment(this.fullTitle())

      it('should create basic app with stylus files', function (done) {
        run(ctx.dir, ['--css', 'stylus'], function (err, stdout) {
          if (err) return done(err)
          ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
          assert.strictEqual(ctx.files.length, 16, 'should have 16 files')
          done()
        })
      })

      it('should have basic files', function () {
        assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1, 'should have bin/www file')
        assert.notStrictEqual(ctx.files.indexOf('app.js'), -1, 'should have app.js file')
        assert.notStrictEqual(ctx.files.indexOf('package.json'), -1, 'should have package.json file')
      })

      it('should have stylus files', function () {
        assert.notStrictEqual(ctx.files.indexOf('public/stylesheets/style.styl'), -1, 'should have style.styl file')
      })

      it('should have stylus in package dependencies', function () {
        var file = path.resolve(ctx.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var pkg = JSON.parse(contents)
        assert.strictEqual(typeof pkg.dependencies.stylus, 'string')
      })

      it('should have installable dependencies', function (done) {
        this.timeout(NPM_INSTALL_TIMEOUT)
        npmInstall(ctx.dir, done)
      })

      describe('npm start', function () {
        before('start app', function () {
          this.app = new AppRunner(ctx.dir)
        })

        after('stop app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.stop(done)
        })

        it('should start app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.start(done)
        })

        it('should respond to HTTP request', function (done) {
          request(this.app)
            .get('/')
            .expect(200, /<title>Express<\/title>/, done)
        })

        it('should respond with stylesheet', function (done) {
          request(this.app)
            .get('/stylesheets/style.css')
            .expect(200, /sans-serif/, done)
        })
      })
    })
  })

  describe('--ejs', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should create basic app with ejs templates', function (done) {
      run(ctx.dir, ['--ejs'], function (err, stdout, warnings) {
        if (err) return done(err)
        ctx.warnings = warnings
        ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
        assert.strictEqual(ctx.files.length, 15, 'should have 15 files')
        done()
      })
    })

    it('should warn about argument rename', function () {
      assert.ok(ctx.warnings.some(function (warn) {
        return warn === 'option `--ejs\' has been renamed to `--view=ejs\''
      }))
    })

    it('should have basic files', function () {
      assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1, 'should have bin/www file')
      assert.notStrictEqual(ctx.files.indexOf('app.js'), -1, 'should have app.js file')
      assert.notStrictEqual(ctx.files.indexOf('package.json'), -1, 'should have package.json file')
    })

    it('should have ejs templates', function () {
      assert.notStrictEqual(ctx.files.indexOf('views/error.ejs'), -1, 'should have views/error.ejs file')
      assert.notStrictEqual(ctx.files.indexOf('views/index.ejs'), -1, 'should have views/index.ejs file')
    })
  })

  describe('--es6', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    if (process.versions.node.split('.')[0] < MIN_ES6_VERSION) {
      it('should exit with code 1', function (done) {
        runRaw(ctx.dir, ['--es6'], function (err, code, stdout, stderr) {
          if (err) return done(err)
          assert.strictEqual(code, 1)
          done()
        })
      })

      it('should print usage and error message', function (done) {
        runRaw(ctx.dir, ['--es6'], function (err, code, stdout, stderr) {
          if (err) return done(err)
          assert.ok(/Usage: express /.test(stdout))
          assert.ok(/--help/.test(stdout))
          assert.ok(/--version/.test(stdout))
          var reg = RegExp('error: option `--es6\' requires Node version ' + MIN_ES6_VERSION)
          assert.ok(reg.test(stderr))
          done()
        })
      })
    } else {
      it('should create basic app', function (done) {
        run(ctx.dir, ['--es6'], function (err, stdout, warnings) {
          if (err) return done(err)
          ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
          ctx.stdout = stdout
          ctx.warnings = warnings
          assert.strictEqual(ctx.files.length, 16)
          done()
        })
      })

      it('should print jade view warning', function () {
        assert.ok(ctx.warnings.some(function (warn) {
          return warn === 'the default view engine will not be jade in future releases\nuse `--view=jade\' or `--help\' for additional options'
        }))
      })

      it('should provide debug instructions', function () {
        assert.ok(/DEBUG=express-1---es6:\* (?:& )?npm start/.test(ctx.stdout))
      })

      it('should have basic files', function () {
        assert.notStrictEqual(ctx.files.indexOf('bin/www.mjs'), -1)
        assert.notStrictEqual(ctx.files.indexOf('app.mjs'), -1)
        assert.notStrictEqual(ctx.files.indexOf('package.json'), -1)
      })

      it('should have jade templates', function () {
        assert.notStrictEqual(ctx.files.indexOf('views/error.jade'), -1)
        assert.notStrictEqual(ctx.files.indexOf('views/index.jade'), -1)
        assert.notStrictEqual(ctx.files.indexOf('views/layout.jade'), -1)
      })

      it('should have a package.json file with type "module"', function () {
        var file = path.resolve(ctx.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        assert.strictEqual(contents, '{\n' +
          '  "name": "express-1---es6",\n' +
          '  "version": "0.0.0",\n' +
          '  "private": true,\n' +
          '  "scripts": {\n' +
          '    "start": "node ./bin/www.mjs"\n' +
          '  },\n' +
          '  "dependencies": {\n' +
          '    "cookie-parser": "~1.4.5",\n' +
          '    "debug": "~2.6.9",\n' +
          '    "express": "~4.17.1",\n' +
          '    "http-errors": "~1.7.2",\n' +
          '    "jade": "~1.11.0",\n' +
          '    "morgan": "~1.10.0"\n' +
          '  },\n' +
          '  "type": "module"\n' +
          '}\n')
      })

      it('should have installable dependencies', function (done) {
        this.timeout(NPM_INSTALL_TIMEOUT)
        npmInstall(ctx.dir, done)
      })

      it('should export an express app from app.mjs', function (done) {
        // Use eval since otherwise early Nodes choke on import reserved word
        // eslint-disable-next-line no-eval
        eval(
          'const { pathToFileURL } = require("url");' +
          'const file = path.resolve(ctx.dir, "app.mjs");' +
          'import(pathToFileURL(file).href)' +
          '.then(moduleNamespaceObject => {' +
            'const app = moduleNamespaceObject.default;' +
            'assert.strictEqual(typeof app, "function");' +
            'assert.strictEqual(typeof app.handle, "function");' +
            'done();' +
          '})' +
          '.catch(reason => done(reason))'
        )
      })

      describe('npm start', function () {
        before('start app', function () {
          this.app = new AppRunner(ctx.dir)
        })

        after('stop app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.stop(done)
        })

        it('should start app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.start(done)
        })

        it('should respond to HTTP request', function (done) {
          request(this.app)
            .get('/')
            .expect(200, /<title>Express<\/title>/, done)
        })

        it('should respond to /users HTTP request', function (done) {
          request(this.app)
            .get('/users')
            .expect(200, /respond with a resource/, done)
        })

        it('should generate a 404', function (done) {
          request(this.app)
            .get('/does_not_exist')
            .expect(404, /<h1>Not Found<\/h1>/, done)
        })
      })
    }
  })

  describe('--git', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should create basic app with git files', function (done) {
      run(ctx.dir, ['--git'], function (err, stdout) {
        if (err) return done(err)
        ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
        assert.strictEqual(ctx.files.length, 17, 'should have 17 files')
        done()
      })
    })

    it('should have basic files', function () {
      assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1, 'should have bin/www file')
      assert.notStrictEqual(ctx.files.indexOf('app.js'), -1, 'should have app.js file')
      assert.notStrictEqual(ctx.files.indexOf('package.json'), -1, 'should have package.json file')
    })

    it('should have .gitignore', function () {
      assert.notStrictEqual(ctx.files.indexOf('.gitignore'), -1, 'should have .gitignore file')
    })

    it('should have jade templates', function () {
      assert.notStrictEqual(ctx.files.indexOf('views/error.jade'), -1)
      assert.notStrictEqual(ctx.files.indexOf('views/index.jade'), -1)
      assert.notStrictEqual(ctx.files.indexOf('views/layout.jade'), -1)
    })
  })

  describe('-h', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should print usage', function (done) {
      run(ctx.dir, ['-h'], function (err, stdout) {
        if (err) return done(err)
        var files = utils.parseCreatedFiles(stdout, ctx.dir)
        assert.strictEqual(files.length, 0)
        assert.ok(/Usage: express /.test(stdout))
        assert.ok(/--help/.test(stdout))
        assert.ok(/--version/.test(stdout))
        done()
      })
    })
  })

  describe('--hbs', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should create basic app with hbs templates', function (done) {
      run(ctx.dir, ['--hbs'], function (err, stdout, warnings) {
        if (err) return done(err)
        ctx.warnings = warnings
        ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
        assert.strictEqual(ctx.files.length, 16)
        done()
      })
    })

    it('should warn about argument rename', function () {
      assert.ok(ctx.warnings.some(function (warn) {
        return warn === 'option `--hbs\' has been renamed to `--view=hbs\''
      }))
    })

    it('should have basic files', function () {
      assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1)
      assert.notStrictEqual(ctx.files.indexOf('app.js'), -1)
      assert.notStrictEqual(ctx.files.indexOf('package.json'), -1)
    })

    it('should have hbs in package dependencies', function () {
      var file = path.resolve(ctx.dir, 'package.json')
      var contents = fs.readFileSync(file, 'utf8')
      var dependencies = JSON.parse(contents).dependencies
      assert.ok(typeof dependencies.hbs === 'string')
    })

    it('should have hbs templates', function () {
      assert.notStrictEqual(ctx.files.indexOf('views/error.hbs'), -1)
      assert.notStrictEqual(ctx.files.indexOf('views/index.hbs'), -1)
      assert.notStrictEqual(ctx.files.indexOf('views/layout.hbs'), -1)
    })
  })

  describe('--help', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should print usage', function (done) {
      run(ctx.dir, ['--help'], function (err, stdout) {
        if (err) return done(err)
        var files = utils.parseCreatedFiles(stdout, ctx.dir)
        assert.strictEqual(files.length, 0)
        assert.ok(/Usage: express /.test(stdout))
        assert.ok(/--help/.test(stdout))
        assert.ok(/--version/.test(stdout))
        done()
      })
    })
  })

  describe('--hogan', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should create basic app with hogan templates', function (done) {
      run(ctx.dir, ['--hogan'], function (err, stdout, warnings) {
        if (err) return done(err)
        ctx.warnings = warnings
        ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
        assert.strictEqual(ctx.files.length, 15)
        done()
      })
    })

    it('should warn about argument rename', function () {
      assert.ok(ctx.warnings.some(function (warn) {
        return warn === 'option `--hogan\' has been renamed to `--view=hjs\''
      }))
    })

    it('should have basic files', function () {
      assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1)
      assert.notStrictEqual(ctx.files.indexOf('app.js'), -1)
      assert.notStrictEqual(ctx.files.indexOf('package.json'), -1)
    })

    it('should have hjs in package dependencies', function () {
      var file = path.resolve(ctx.dir, 'package.json')
      var contents = fs.readFileSync(file, 'utf8')
      var dependencies = JSON.parse(contents).dependencies
      assert.ok(typeof dependencies.hjs === 'string')
    })

    it('should have hjs templates', function () {
      assert.notStrictEqual(ctx.files.indexOf('views/error.hjs'), -1)
      assert.notStrictEqual(ctx.files.indexOf('views/index.hjs'), -1)
    })
  })

  describe('--no-view', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should create basic app without view engine', function (done) {
      run(ctx.dir, ['--no-view'], function (err, stdout) {
        if (err) return done(err)
        ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
        assert.strictEqual(ctx.files.length, 13)
        done()
      })
    })

    it('should have basic files', function () {
      assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1)
      assert.notStrictEqual(ctx.files.indexOf('app.js'), -1)
      assert.notStrictEqual(ctx.files.indexOf('package.json'), -1)
    })

    it('should not have views directory', function () {
      assert.strictEqual(ctx.files.indexOf('views'), -1)
    })

    it('should have installable dependencies', function (done) {
      this.timeout(NPM_INSTALL_TIMEOUT)
      npmInstall(ctx.dir, done)
    })

    describe('npm start', function () {
      before('start app', function () {
        this.app = new AppRunner(ctx.dir)
      })

      after('stop app', function (done) {
        this.timeout(APP_START_STOP_TIMEOUT)
        this.app.stop(done)
      })

      it('should start app', function (done) {
        this.timeout(APP_START_STOP_TIMEOUT)
        this.app.start(done)
      })

      it('should respond to HTTP request', function (done) {
        request(this.app)
          .get('/')
          .expect(200, /<title>Express<\/title>/, done)
      })

      it('should generate a 404', function (done) {
        request(this.app)
          .get('/does_not_exist')
          .expect(404, /Cannot GET \/does_not_exist/, done)
      })
    })
  })

  describe('--pug', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should create basic app with pug templates', function (done) {
      run(ctx.dir, ['--pug'], function (err, stdout, warnings) {
        if (err) return done(err)
        ctx.warnings = warnings
        ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
        assert.strictEqual(ctx.files.length, 16)
        done()
      })
    })

    it('should warn about argument rename', function () {
      assert.ok(ctx.warnings.some(function (warn) {
        return warn === 'option `--pug\' has been renamed to `--view=pug\''
      }))
    })

    it('should have basic files', function () {
      assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1)
      assert.notStrictEqual(ctx.files.indexOf('app.js'), -1)
      assert.notStrictEqual(ctx.files.indexOf('package.json'), -1)
    })

    it('should have pug in package dependencies', function () {
      var file = path.resolve(ctx.dir, 'package.json')
      var contents = fs.readFileSync(file, 'utf8')
      var dependencies = JSON.parse(contents).dependencies
      assert.ok(typeof dependencies.pug === 'string')
    })

    it('should have pug templates', function () {
      assert.notStrictEqual(ctx.files.indexOf('views/error.pug'), -1)
      assert.notStrictEqual(ctx.files.indexOf('views/index.pug'), -1)
      assert.notStrictEqual(ctx.files.indexOf('views/layout.pug'), -1)
    })
  })

  describe('--version', function () {
    var ctx = setupTestEnvironment(this.fullTitle())

    it('should print version', function (done) {
      var pkg = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
      var ver = JSON.parse(pkg).version
      run(ctx.dir, ['--version'], function (err, stdout) {
        if (err) return done(err)
        assert.strictEqual(stdout.replace(/[\r\n]+/, '\n'), ver + '\n')
        done()
      })
    })
  })

  describe('--view <engine>', function () {
    describe('(no engine)', function () {
      var ctx = setupTestEnvironment(this.fullTitle())

      it('should exit with code 1', function (done) {
        runRaw(ctx.dir, ['--view'], function (err, code, stdout, stderr) {
          if (err) return done(err)
          assert.strictEqual(code, 1)
          done()
        })
      })

      it('should print usage', function (done) {
        runRaw(ctx.dir, ['--view'], function (err, code, stdout) {
          if (err) return done(err)
          assert.ok(/Usage: express /.test(stdout))
          assert.ok(/--help/.test(stdout))
          assert.ok(/--version/.test(stdout))
          done()
        })
      })

      it('should print argument missing', function (done) {
        runRaw(ctx.dir, ['--view'], function (err, code, stdout, stderr) {
          if (err) return done(err)
          assert.ok(/error: option .* argument missing/.test(stderr))
          done()
        })
      })
    })

    describe('dust', function () {
      var ctx = setupTestEnvironment(this.fullTitle())

      it('should create basic app with dust templates', function (done) {
        run(ctx.dir, ['--view', 'dust'], function (err, stdout) {
          if (err) return done(err)
          ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
          assert.strictEqual(ctx.files.length, 15, 'should have 15 files')
          done()
        })
      })

      it('should have basic files', function () {
        assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1, 'should have bin/www file')
        assert.notStrictEqual(ctx.files.indexOf('app.js'), -1, 'should have app.js file')
        assert.notStrictEqual(ctx.files.indexOf('package.json'), -1, 'should have package.json file')
      })

      it('should have dust templates', function () {
        assert.notStrictEqual(ctx.files.indexOf('views/error.dust'), -1, 'should have views/error.dust file')
        assert.notStrictEqual(ctx.files.indexOf('views/index.dust'), -1, 'should have views/index.dust file')
      })

      it('should have adaro in package dependencies', function () {
        var file = path.resolve(ctx.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var pkg = JSON.parse(contents)
        assert.strictEqual(typeof pkg.dependencies.adaro, 'string')
      })

      it('should have installable dependencies', function (done) {
        this.timeout(NPM_INSTALL_TIMEOUT)
        npmInstall(ctx.dir, done)
      })

      describe('npm start', function () {
        before('start app', function () {
          this.app = new AppRunner(ctx.dir)
        })

        after('stop app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.stop(done)
        })

        it('should start app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.start(done)
        })

        it('should respond to HTTP request', function (done) {
          request(this.app)
            .get('/')
            .expect(200, /<title>Express<\/title>/, done)
        })

        it('should generate a 404', function (done) {
          request(this.app)
            .get('/does_not_exist')
            .expect(404, /<h1>Not Found<\/h1>/, done)
        })
      })
    })

    describe('ejs', function () {
      var ctx = setupTestEnvironment(this.fullTitle())

      it('should create basic app with ejs templates', function (done) {
        run(ctx.dir, ['--view', 'ejs'], function (err, stdout) {
          if (err) return done(err)
          ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
          assert.strictEqual(ctx.files.length, 15, 'should have 15 files')
          done()
        })
      })

      it('should have basic files', function () {
        assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1, 'should have bin/www file')
        assert.notStrictEqual(ctx.files.indexOf('app.js'), -1, 'should have app.js file')
        assert.notStrictEqual(ctx.files.indexOf('package.json'), -1, 'should have package.json file')
      })

      it('should have ejs templates', function () {
        assert.notStrictEqual(ctx.files.indexOf('views/error.ejs'), -1, 'should have views/error.ejs file')
        assert.notStrictEqual(ctx.files.indexOf('views/index.ejs'), -1, 'should have views/index.ejs file')
      })

      it('should have ejs in package dependencies', function () {
        var file = path.resolve(ctx.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var pkg = JSON.parse(contents)
        assert.strictEqual(typeof pkg.dependencies.ejs, 'string')
      })

      it('should have installable dependencies', function (done) {
        this.timeout(NPM_INSTALL_TIMEOUT)
        npmInstall(ctx.dir, done)
      })

      describe('npm start', function () {
        before('start app', function () {
          this.app = new AppRunner(ctx.dir)
        })

        after('stop app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.stop(done)
        })

        it('should start app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.start(done)
        })

        it('should respond to HTTP request', function (done) {
          request(this.app)
            .get('/')
            .expect(200, /<title>Express<\/title>/, done)
        })

        it('should generate a 404', function (done) {
          request(this.app)
            .get('/does_not_exist')
            .expect(404, /<h1>Not Found<\/h1>/, done)
        })
      })
    })

    describe('hbs', function () {
      var ctx = setupTestEnvironment(this.fullTitle())

      it('should create basic app with hbs templates', function (done) {
        run(ctx.dir, ['--view', 'hbs'], function (err, stdout) {
          if (err) return done(err)
          ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
          assert.strictEqual(ctx.files.length, 16)
          done()
        })
      })

      it('should have basic files', function () {
        assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1)
        assert.notStrictEqual(ctx.files.indexOf('app.js'), -1)
        assert.notStrictEqual(ctx.files.indexOf('package.json'), -1)
      })

      it('should have hbs in package dependencies', function () {
        var file = path.resolve(ctx.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var dependencies = JSON.parse(contents).dependencies
        assert.ok(typeof dependencies.hbs === 'string')
      })

      it('should have hbs templates', function () {
        assert.notStrictEqual(ctx.files.indexOf('views/error.hbs'), -1)
        assert.notStrictEqual(ctx.files.indexOf('views/index.hbs'), -1)
        assert.notStrictEqual(ctx.files.indexOf('views/layout.hbs'), -1)
      })

      it('should have installable dependencies', function (done) {
        this.timeout(NPM_INSTALL_TIMEOUT)
        npmInstall(ctx.dir, done)
      })

      describe('npm start', function () {
        before('start app', function () {
          this.app = new AppRunner(ctx.dir)
        })

        after('stop app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.stop(done)
        })

        it('should start app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.start(done)
        })

        it('should respond to HTTP request', function (done) {
          request(this.app)
            .get('/')
            .expect(200, /<title>Express<\/title>/, done)
        })

        it('should generate a 404', function (done) {
          request(this.app)
            .get('/does_not_exist')
            .expect(404, /<h1>Not Found<\/h1>/, done)
        })
      })
    })

    describe('hjs', function () {
      var ctx = setupTestEnvironment(this.fullTitle())

      it('should create basic app with hogan templates', function (done) {
        run(ctx.dir, ['--view', 'hjs'], function (err, stdout) {
          if (err) return done(err)
          ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
          assert.strictEqual(ctx.files.length, 15)
          done()
        })
      })

      it('should have basic files', function () {
        assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1)
        assert.notStrictEqual(ctx.files.indexOf('app.js'), -1)
        assert.notStrictEqual(ctx.files.indexOf('package.json'), -1)
      })

      it('should have hjs in package dependencies', function () {
        var file = path.resolve(ctx.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var dependencies = JSON.parse(contents).dependencies
        assert.ok(typeof dependencies.hjs === 'string')
      })

      it('should have hjs templates', function () {
        assert.notStrictEqual(ctx.files.indexOf('views/error.hjs'), -1)
        assert.notStrictEqual(ctx.files.indexOf('views/index.hjs'), -1)
      })

      it('should have installable dependencies', function (done) {
        this.timeout(NPM_INSTALL_TIMEOUT)
        npmInstall(ctx.dir, done)
      })

      describe('npm start', function () {
        before('start app', function () {
          this.app = new AppRunner(ctx.dir)
        })

        after('stop app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.stop(done)
        })

        it('should start app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.start(done)
        })

        it('should respond to HTTP request', function (done) {
          request(this.app)
            .get('/')
            .expect(200, /<title>Express<\/title>/, done)
        })

        it('should generate a 404', function (done) {
          request(this.app)
            .get('/does_not_exist')
            .expect(404, /<h1>Not Found<\/h1>/, done)
        })
      })
    })

    describe('pug', function () {
      var ctx = setupTestEnvironment(this.fullTitle())

      it('should create basic app with pug templates', function (done) {
        run(ctx.dir, ['--view', 'pug'], function (err, stdout) {
          if (err) return done(err)
          ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
          assert.strictEqual(ctx.files.length, 16)
          done()
        })
      })

      it('should have basic files', function () {
        assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1)
        assert.notStrictEqual(ctx.files.indexOf('app.js'), -1)
        assert.notStrictEqual(ctx.files.indexOf('package.json'), -1)
      })

      it('should have pug in package dependencies', function () {
        var file = path.resolve(ctx.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var dependencies = JSON.parse(contents).dependencies
        assert.ok(typeof dependencies.pug === 'string')
      })

      it('should have pug templates', function () {
        assert.notStrictEqual(ctx.files.indexOf('views/error.pug'), -1)
        assert.notStrictEqual(ctx.files.indexOf('views/index.pug'), -1)
        assert.notStrictEqual(ctx.files.indexOf('views/layout.pug'), -1)
      })

      it('should have installable dependencies', function (done) {
        this.timeout(NPM_INSTALL_TIMEOUT)
        npmInstall(ctx.dir, done)
      })

      describe('npm start', function () {
        before('start app', function () {
          this.app = new AppRunner(ctx.dir)
        })

        after('stop app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.stop(done)
        })

        it('should start app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.start(done)
        })

        it('should respond to HTTP request', function (done) {
          request(this.app)
            .get('/')
            .expect(200, /<title>Express<\/title>/, done)
        })

        it('should generate a 404', function (done) {
          request(this.app)
            .get('/does_not_exist')
            .expect(404, /<h1>Not Found<\/h1>/, done)
        })
      })
    })

    describe('twig', function () {
      var ctx = setupTestEnvironment(this.fullTitle())

      it('should create basic app with twig templates', function (done) {
        run(ctx.dir, ['--view', 'twig'], function (err, stdout) {
          if (err) return done(err)
          ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
          assert.strictEqual(ctx.files.length, 16)
          done()
        })
      })

      it('should have basic files', function () {
        assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1)
        assert.notStrictEqual(ctx.files.indexOf('app.js'), -1)
        assert.notStrictEqual(ctx.files.indexOf('package.json'), -1)
      })

      it('should have twig in package dependencies', function () {
        var file = path.resolve(ctx.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var dependencies = JSON.parse(contents).dependencies
        assert.ok(typeof dependencies.twig === 'string')
      })

      it('should have twig templates', function () {
        assert.notStrictEqual(ctx.files.indexOf('views/error.twig'), -1)
        assert.notStrictEqual(ctx.files.indexOf('views/index.twig'), -1)
        assert.notStrictEqual(ctx.files.indexOf('views/layout.twig'), -1)
      })

      it('should have installable dependencies', function (done) {
        this.timeout(NPM_INSTALL_TIMEOUT)
        npmInstall(ctx.dir, done)
      })

      describe('npm start', function () {
        before('start app', function () {
          this.app = new AppRunner(ctx.dir)
        })

        after('stop app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.stop(done)
        })

        it('should start app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.start(done)
        })

        it('should respond to HTTP request', function (done) {
          request(this.app)
            .get('/')
            .expect(200, /<title>Express<\/title>/, done)
        })

        it('should generate a 404', function (done) {
          request(this.app)
            .get('/does_not_exist')
            .expect(404, /<h1>Not Found<\/h1>/, done)
        })
      })
    })

    describe('vash', function () {
      var ctx = setupTestEnvironment(this.fullTitle())

      it('should create basic app with vash templates', function (done) {
        run(ctx.dir, ['--view', 'vash'], function (err, stdout) {
          if (err) return done(err)
          ctx.files = utils.parseCreatedFiles(stdout, ctx.dir)
          assert.strictEqual(ctx.files.length, 16)
          done()
        })
      })

      it('should have basic files', function () {
        assert.notStrictEqual(ctx.files.indexOf('bin/www'), -1)
        assert.notStrictEqual(ctx.files.indexOf('app.js'), -1)
        assert.notStrictEqual(ctx.files.indexOf('package.json'), -1)
      })

      it('should have vash in package dependencies', function () {
        var file = path.resolve(ctx.dir, 'package.json')
        var contents = fs.readFileSync(file, 'utf8')
        var dependencies = JSON.parse(contents).dependencies
        assert.ok(typeof dependencies.vash === 'string')
      })

      it('should have vash templates', function () {
        assert.notStrictEqual(ctx.files.indexOf('views/error.vash'), -1)
        assert.notStrictEqual(ctx.files.indexOf('views/index.vash'), -1)
        assert.notStrictEqual(ctx.files.indexOf('views/layout.vash'), -1)
      })

      it('should have installable dependencies', function (done) {
        this.timeout(NPM_INSTALL_TIMEOUT)
        npmInstall(ctx.dir, done)
      })

      describe('npm start', function () {
        before('start app', function () {
          this.app = new AppRunner(ctx.dir)
        })

        after('stop app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.stop(done)
        })

        it('should start app', function (done) {
          this.timeout(APP_START_STOP_TIMEOUT)
          this.app.start(done)
        })

        it('should respond to HTTP request', function (done) {
          request(this.app)
            .get('/')
            .expect(200, /<title>Express<\/title>/, done)
        })

        it('should generate a 404', function (done) {
          request(this.app)
            .get('/does_not_exist')
            .expect(404, /<h1>Not Found<\/h1>/, done)
        })
      })
    })
  })
})

function npmInstall (dir, callback) {
  var env = utils.childEnvironment()

  exec('npm install', { cwd: dir, env: env, maxBuffer: STDERR_MAX_BUFFER }, function (err, stderr) {
    if (err) {
      err.message += stderr
      callback(err)
      return
    }

    callback()
  })
}

function run (dir, args, callback) {
  runRaw(dir, args, function (err, code, stdout, stderr) {
    if (err) {
      return callback(err)
    }

    process.stderr.write(utils.stripWarnings(stderr))

    try {
      assert.strictEqual(utils.stripWarnings(stderr), '')
      assert.strictEqual(code, 0)
    } catch (e) {
      return callback(e)
    }

    callback(null, utils.stripColors(stdout), utils.parseWarnings(stderr))
  })
}

function runRaw (dir, args, callback) {
  var argv = [BIN_PATH].concat(args)
  var binp = process.argv[0]
  var stderr = ''
  var stdout = ''

  var child = spawn(binp, argv, {
    cwd: dir
  })

  child.stdout.setEncoding('utf8')
  child.stdout.on('data', function ondata (str) {
    stdout += str
  })
  child.stderr.setEncoding('utf8')
  child.stderr.on('data', function ondata (str) {
    stderr += str
  })

  child.on('close', onclose)
  child.on('error', callback)

  function onclose (code) {
    callback(null, code, stdout, stderr)
  }
}

function setupTestEnvironment (name) {
  var ctx = {}

  before('create environment', function (done) {
    ctx.dir = path.join(TEMP_DIR, name.replace(/[<>]/g, ''))
    mkdirp(ctx.dir, done)
  })

  after('cleanup environment', function (done) {
    this.timeout(30000)
    rimraf(ctx.dir, done)
  })

  return ctx
}
