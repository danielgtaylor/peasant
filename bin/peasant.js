#!/usr/bin/env node

'use strict';

var peasant = require('../index');
var each = require('async-each-series');

var args = require('yargs')
  .usage('$0 [options] command')
  .options('g', {
    alias: 'grep',
    description: 'Run specific tests via regexp'
  })
  .options('s', {
    alias: 'sourcemaps',
    description: 'Generate sourcemaps',
    boolean: true
  })
  .help('h')
  .alias('h', 'help')
  .version(function () {
    return require('../package').version;
  })
  .command('init', 'Initialize a repository')
  .command('lint', 'Source code error & style check')
  .command('build', 'Transpile sources for release')
  .command('test', 'Run tests')
  .command('cover', 'Generate test coverage reports')
  .example('$0 -s lint build', 'Lint and transpile sources with source maps')
  .example('$0 test', 'Run unit tests')
  .demand(1)
  .strict()
  .argv;

// Process each subcommand in order.
each(args._, function (item, done) {
  switch(item) {
    case 'init':
      peasant.init(done);
      break;
    case 'lint':
      peasant.lint(done);
      break;
    case 'build':
      peasant.build(args.sourcemaps, done);
      break;
    case 'test':
      var options = {};

      if (args.grep) {
        options.grep = args.grep;
      }

      peasant.test(options, done);
      break;
    case 'cover':
      peasant.cover(done);
      break;
    default:
      return done(new Error('Unknown command ' + item));
  }
}, function (err) {
  if (err && err instanceof Error) {
    console.error(err.stack);
  }
});
