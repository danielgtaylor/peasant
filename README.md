# Peasant
An opinionated build helper for ES6 modules built for Node.js. It includes the ability to lint, transpile, test, and generate coverage reports for your module and is ideal for use in npm scripts to keep your module simple. Let the brave peasant do the heavy lifting.

Built on popular, well-tested components like [Babel](https://babeljs.io/), [ESLint](http://eslint.org/), and [Mocha](https://mochajs.org/).

Opinionated bits:

* All source must go in the `src` folder.
* All tests must go in the `test` folder.
* You must use either `.js` or `.es6` as an extension.
* Tests must be written for Mocha, but can use any assertion library.
* Tests *should* `import`/`require` the files from `src`.
* All code *should* use the [Airbnb Javascript Style Guide](https://github.com/airbnb/javascript).
* You package main must point to the transpiled files in `lib`.

## Quick Start
Peasant includes a command to quickly start using it in your project. You can install it globally to use this:

```sh
npm install -g peasant
```

Assuming you want to start a new project, you would do something like this:

```sh
mkdir my-new-project
cd my-new-project
npm init
mkdir src test
peasant init
```

For existing projects, you can omit all but the last step! Note, this may overwrite customized data in your `package.json`, so be careful. It's best to use version control and see a diff of the changes before you commit to them.

```sh
cd my-existing-project
peasant init
```

You now have several commands available:

```sh
# Lint code
npm run lint

# Run tests
npm test

# Run tests filtered by regular expression
npm test -- -g MY_REGEX

# Generate coverage reports
npm run cover

# Run arbitrary subcommands
npm run peasant -- lint build ...
```

When publishing the package, an additional build step will generate the `lib` directory with the transpiled sources.

## Manual Usage
Instead of using the `peasant init` command above, you can also manually install and use Peasant.

```sh
npm install --save-dev peasant
```

Then, in your `package.json`:

```json
{
  "scripts": {
    "test": "peasant test lint"
  }
}
```

Don't forget to run `peasant link` if you want to use linting plugins with your text editor that require a local version of ESLint. These links are also automatically created anytime you run `peasant lint`.

### Available Subcommands
The following subcommands are currently available, and can be combined however you want. They will be run in the order given, e.g. `peasant test lint`.

#### Init
Bootstrap a project to use Peasant. See the quick start above for an example of how and when to use this command.

```sh
peasant init
```

#### Link
Manually create symbolic links to enable linting. These links are required if you want to use your text editor for live linting, and are created for you when running the `peasant lint` subcommand described below or when using `peasant init` or running `npm install` in a development checkout. You should not need this subcommand unless setting Peasant up manually.

Creates the following links:

* `./node_modules/.bin/eslint`
* `./node_modules/eslint`
* `./node_modules/eslint-config-airbnb`
* `./node_modules/babel-eslint`

```sh
peasant link
```

#### Lint
Use the `lint` subcommand to lint all your source code, using `babel-eslint` to parse ES6 code. Uses the [Airbnb Javascript Style Guide](https://github.com/airbnb/javascript), but you can provide your own rule overrides in `.eslintrc`.

```sh
peasant lint
```

#### Build
Use the `build` subcommand to transpile your source code using `babel`. This uses the optional [Babel runtime](https://babeljs.io/docs/usage/runtime/) component.

```sh
# Default build
peasant build

# Enable source maps
peasant -s build
```

#### Test
Use the `test` subcommand to run all your tests using [Mocha](). Uses the Babel require hook to enable ES6 tests and code. Your tests should directly reference the code in the `src` directory instead of relying on the transpiled `lib` directory.

```sh
peasant test
```

#### Cover
Generate coverage reports from your tests. This will create a new directory called `coverage` and it will contain an LCOV report as well as HTML in `coverage/lcov-report/index.html`.

```sh
peasant cover
```

## Customization
Nope. Just kidding! Propose something in a new issue!

## License
Copyright &copy; 2015 Daniel G. Taylor

http://dgt.mit-license.org/
