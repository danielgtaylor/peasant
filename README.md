# Peasant
An opinionated build helper for ES6 modules built for Node.js. It includes the ability to lint, transpile, test, and generate coverage reports for your module and is ideal for use in npm scripts to keep your module simple. Let the brave peasant do the heavy lifting.

Built on popular, well-tested components like ESLint and Mocha.

Opinionated bits:

* All source must go in the `src` folder.
* All tests must go in the `test` folder.
* You must use either `.js` or `.es6` as an extension.
* Tests must be written for Mocha, but can use any assertion library.
* Tests *should* `import`/`require` the files from `src`.
* You package main should point to the transpiled files in `lib`.

## Quick Start
Peasant includes a command to quickly start using it in your project. You can install it globally to use this:

```sh
npm install -g peasant
```

Assuming you want to start a new project, you would do something like this:

```sh
mkdir my-project
cd my-project
npm init
mkdir src
mkdir test
peasant init
```

For existing projects, you can omit all but the last step! Note, this may overwrite customized data in your `package.json`, so be careful. It's best to use version control and see a diff of the changes before you commit to them.

You now have several commands available:

```sh
# Run tests
npm test

# Generate coverage reports
npm run cover
```

When publishing the package, an additional build step will generate the `lib` directory with the transpiled sources.

## Manual Usage

```sh
npm install peasant
```

Then, in your `package.json`:

```json
{
  "scripts": {
    "test": "peasant test lint"
  }
}
```

### Available Subcommands
The following subcommands are currently available, and can be combined however you want. They will be run in the order given, e.g. `peasant test lint`.

#### Lint
Use the `lint` subcommand to lint all your source code, using `babel-eslint` to parse ES6 code. Uses the [Airbnb Javascript Style Guide]().

```sh
peasant lint
```

#### Build
Use the `build` subcommand to transpile your source code using `babel`. This uses the optional [Babel runtime]() component.

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
