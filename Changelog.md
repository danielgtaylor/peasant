# 0.5.2 - 2015-09-14

- Update to mocha-better-spec-reporter 2.1.2 to get better text diff output on test failures.

# 0.5.1 - 2015-09-12

- Speed up linting by using the new ESLint `cache` option.

# 0.5.0 - 2015-09-09

- Use a new strategy for handling linting and remove the requirement that consumers of Peasant need any other package installed other than Peasant itself. This adds a new `link` command that is run on dev install, ci, etc and enables text editor linting to work painlessly.
- Update the default npm scripts based on user feedback.

# 0.4.0 - 2015-09-09

- Require `eslint` to be installed as a dev dependency of new packages so that linting works as expected in most text editors.

# 0.3.1 - 2015-09-07

- Fix broken incremental builds.

# 0.3.0 - 2015-09-07

- Change the behavior of the linter to use an `.eslintrc` configuration file to work better with text editors and allow rule customization. This means that `eslint-config-airbnb` is installed alongside `peasant` instead of as a dependency.
- The `init` command now creates a new `npm run lint` script.
- Documentation updates and small fixes.

# 0.2.0 - 2015-09-06

- Change default `package.json` scripts setup for `peasant init` subcommand.
- Install `babel-runtime` during `peasant init`.
- Fix source map parameter bug.

# 0.1.2 - 2015-09-06

- Add forgotten dependency.

# 0.1.1 - 2015-09-06

- Build with source maps by default when using `peasant init`.
- Updated documentation.

# 0.1.0 - 2015-09-05

- Initial release.
