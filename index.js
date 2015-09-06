var chalk = require('chalk');
var fs = require('fs');
var glob = require('glob');

/*
 * Print out a message with our icon and your message.
 */
function log(message) {
  console.log(chalk.magenta('🔎  ' + message));
}

/*
 * Retruns true if the source is newer than the destination filename.
 */
function newer(source, dest) {
  try {
    sTime = fs.statSync(source).mtime;
    dTime = fs.statSync(dest).mtime;

    return sTime > dTime;
  } catch (err) {
    return true;
  }
}

/*
 * Initialize a repository to use peasant.
 */
function init(done) {
  var exec = require('child_process').exec;
  var path = require('path');
  var pkgPath = path.join(process.cwd(), 'package.json');

  log('Installing peasant...');
  exec('npm install --save-dev peasant', {shell: true}, function(err, stdout, stderr) {
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    if (err) {
      return done(err);
    }

    log('Modifying package.json scripts...');

    var pkg = require(pkgPath);
    if (pkg.scripts === undefined) {
      pkg.scripts = {};
    }
    pkg.scripts.cover = 'peasant cover'
    pkg.scripts.test = 'peasant test lint'
    pkg.scripts.prepublish = 'peasant -s build'

    fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8', done);
  });
}

/*
 * Lint all sources against the Airbnb style guide.
 */
function lint(done) {
  log('Linting sources...');
  var eslint = require('eslint');
  var config = require('eslint-config-airbnb/base');

  var linter = new eslint.CLIEngine(config);
  var results = linter.executeOnFiles(glob.sync('{bin,src,test}/**/*.{js,es6}'));

  var output = linter.getFormatter('stylish')(results.results)
  if (output) {
    console.log(output);
  }

  setTimeout(function () {
    done(results.errorCount > 0);
  }, 0);
}

/*
 * Generate transpiled sources for deployment.
 */
function build(options, done) {
  log('Building...');

  var babel = require('babel-core');
  var mkdirp = require('mkdirp').sync;
  var path = require('path');

  var babelOpts = {
    ast: false,
    optional: ['runtime']
  };

  if (options.sourcemaps) {
    babelOpts.sourceMaps = true;
  }

  glob.sync('src/**/*.{js,es6}').forEach(function(filename) {
    var newname = filename.replace(/^src/, 'lib').replace(/es6$/, 'js');
    var result;

    if (newer(filename, newname)) {
      console.log(filename + ' -> ' + newname);

      result = babel.transformFileSync(filename, babelOpts);

      mkdirp(path.dirname(newname));

      if (options.sourcemaps) {
        var sourcemap = newname.replace(/js$/, 'map');
        result.code += '\n//# sourceMappingURL=' + path.basename(sourcemap);
        fs.writeFileSync(sourcemap, JSON.stringify(result.map), 'utf8');
      }

      fs.writeFileSync(newname, result.code, 'utf8');
    }
  });

  done();
}

/*
 * Run mocha tests on all code. Supports ES6, so your tests should just
 * import directly from the `src` directory instead of the transpiled `lib`.
 */
function test(options, done) {
  log('Running tests...');

  try {
    require('babel-core/register');
  } catch (err) {
    // Babel may have already been imported...
  }

  if (options.reporter === undefined) {
    options.reporter = require('mocha-better-spec-reporter')
  }

  var Mocha = require('mocha');
  var mocha = new Mocha(options);

  glob.sync('test/**/*.{js,es6}').forEach(function(filename) {
    //console.log('Adding ' + filename);
    mocha.addFile(filename);
  });

  mocha.run(done);
}

/*
 * Write test coverage reports.
 */
function cover(done) {
  var Module = require('module');
  var path = require('path');

  var isparta = require('isparta');

  // Preload require hook before we override it with the transformer below.
  require('babel-core/register');

  var reporter = new isparta.Reporter();
  reporter.add('text-summary');
  reporter.add('lcov');

  isparta.matcherFor({
    root: process.cwd(),
    includes: ['src/**/*.{js,es6}']
  }, function(err, matchFn) {
    if (err) {
      return done(err);
    }

    try {
      var coverageVar = '$$coverage$$';
      var instrumenter = new isparta.Instrumenter({
        coverageVariable: coverageVar
      });
      var transformer = function(code, fileName) {
        // Comment out shebang line if it exists.
        if (code[0] === '#') {
          code = '//' + code.substr(2);
        }

        return instrumenter.instrumentSync(code, fileName);
      }

      isparta.hook.hookRequire(matchFn, transformer);

      global[coverageVar] = {};

      process.once('exit', function(code) {
        if (code) {
          process.exit(code);
        }

        if (Object.keys(global[coverageVar]).length === 0) {
          console.log('No coverage information collected.');
          return;
        }

        log('Writing coverage report...');

        var collector = new isparta.Collector();
        collector.add(global[coverageVar]);
        reporter.write(collector, true, function (err) {
          if (err) {
            console.log(err);
            process.exit(1);
          }
        });
      });

      var peasant = path.join(__dirname, 'bin', 'peasant.js');
      process.argv = ['node', peasant, 'test'];
      process.env.running_under_istanbul = true;
      test({reporter: 'dot'}, done);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = {
  init: init,
  lint: lint,
  build: build,
  test: test,
  cover: cover
}
