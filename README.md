# Peasant
An opinionated build helper for ES6 modules built for Node.js. It includes the ability to lint, transpile, test, and generate coverage reports for your module and is ideal for use in npm scripts to keep your module simple. Let the brave peasant do the heavy lifting.

Built on popular, well-tested components like ESLint and Mocha.

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
peasant init
```

For existing projects, you can omit all but the last step! Note, this may overwrite customized data in your `package.json`.

## Usage

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

## Customization
Nope. Just kidding! Propose something in a new issue!
