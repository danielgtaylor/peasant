'use strict';

var chalk = require('chalk');
var fs = require('fs');
var glob = require('glob');
var path = require('path');

var LINT_CONFIG = '// Generated by Peasant\n{\n  "extends": "airbnb/base",\n  "env": {\n    "mocha": true\n  }\n}\n';
var BABEL_CONFIG = '// Generated by Peasant\n{\n  "presets": ["env"]\n}\n';
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
    var sTime = fs.statSync(source).mtime;
    var dTime = fs.statSync(dest).mtime;

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
  var pkgPath = path.join(process.cwd(), 'package.json');

  log('Installing dependencies...');
  exec('npm install --save-dev peasant', function(err, stdout, stderr) {
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

    pkg.scripts.lint = 'peasant lint'
    pkg.scripts.test = 'peasant test'
    pkg.scripts.build = 'peasant -s build'
    pkg.scripts.web = 'peasant -w build'
    pkg.scripts.cover = 'peasant cover'
    pkg.scripts.peasant = 'peasant'
    pkg.scripts.ci = 'peasant -s lint test'
    pkg.scripts.prepublishOnly = 'npm run ci && npm run build && npm run web'

    fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8', function (err) {
      if (err) {
        return done(err);
      }

      log('Writing linter configuration...');

      fs.writeFile(path.join(process.cwd(), '.eslintrc'), LINT_CONFIG, 'utf8', function (err) {
        if (err) {
          return done(err);
        }

        log('Creating babel configuration...');

        fs.writeFile(path.join(process.cwd(), '.babelrc'), BABEL_CONFIG, 'utf8', function (err) {
          if (err) {
            return done(err);
          }

          log('Creating linter links...');
          link(done);
        });
      });
    });
  });
}

/*
 * Create symlinks to make lint plugins, configs, and text editors work.
 */
function link(done) {
  var base = path.join(process.cwd(), 'node_modules');
  var links = [
    path.join('.bin', 'eslint'),
    'eslint',
    'babel-preset-env',
    'babel-eslint',
    'eslint-config-airbnb',
    'eslint-plugin-import',
    'eslint-plugin-react',
    'eslint-plugin-jsx-a11y',
  ];

  for (var i = 0; i < links.length; i++) {
    var target = path.join(base, 'peasant', 'node_modules', links[i]);
    var filename = path.join(base, links[i]);

    var exists = true;
    try {
      var stat = fs.lstatSync(filename)
    } catch (err) {
      exists = false;
    }

    if (!exists) {
      //console.log(path.join('node_modules', links[i]));
      fs.symlinkSync(target, filename);
    }
  }

  done();
}

/*
 * Lint all sources against the Airbnb style guide.
 */
function lint(done) {
  log('Linting sources...');
  link(function (err) {
    if (err) {
      return done(err);
    }

    var eslint = require('eslint');

    var linter = new eslint.CLIEngine({
      cache: true
    });
    var results = linter.executeOnFiles(glob.sync('{bin,src,test}/**/*.{js,es6}'));

    var output = linter.getFormatter('stylish')(results.results)
    if (output) {
      console.log(output);
    }

    setTimeout(function () {
      done(results.errorCount > 0);
    }, 0);
  });
}

/*
 * Generate transpiled sources for deployment.
 */
function build(options, done) {
  log('Building...');

  if (options.web) {
    return web(options, done);
  }

  var babel = require('babel-core');
  var mkdirp = require('mkdirp').sync;
  var path = require('path');

  var babelOpts = {
    ast: false
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
 * Generate transpiled sources for web deployment.
 */
function web(options, done) {
  var mkdirp = require('mkdirp').sync;
  var webpack = require('webpack');
  var Uglify = require('uglifyjs-webpack-plugin');
  var library = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  mkdirp(path.resolve('./lib'));

  webpack({
    entry: path.resolve(library.module),
    devtool: 'source-map',
    output: {
      path: path.resolve('./lib'),
      filename: library.name + '.min.js',
      library: library.name,
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
    module: {
      loaders: [
        {
          test: /(\.jsx|\.js)$/,
          loader: 'babel-loader',
          exclude: /(node_modules|bower_components)/
        }
      ]
    },
    plugins: [
      new Uglify()
    ],
    resolve: {
      modules: [path.resolve('./src'), 'node_modules'],
      extensions: ['.js']
    }
  }, function (err, stats) {
    if (err) console.log(err);

    done();
  });
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
  link: link,
  lint: lint,
  build: build,
  test: test,
  cover: cover
}
