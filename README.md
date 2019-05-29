# Typescript monorepo for React project

## What I want to achieve?

- [Monorepo](https://www.atlassian.com/git/tutorials/monorepos) project, to be able to comfortably to develop several packages, which can be used separately but as well together
- Typescript
- React
- Testing library. I want to start with Jest, but as well we can choose something else
- Storybook (or similar tool) for React components development and showcasing
- (nice to have, but optional) ESlint with [eslint-config-react-app](https://www.npmjs.com/package/eslint-config-react-app)
- (nice to have, but optional) Rollup to bundle and minify
- (nice to have, but optional) pre-commit hooks with prettier

## Packages structure

- [`d`](packages/d) - utility library
- [`b`](packages/b) - React components library, which depends on `d`
- [`c`](packages/c) - another React components library, which depends on `d`
- [`stories`](packages/stories) - showcase of `b` and `c` package's compnents as well used for development (initial plan, can change later)

## Tools

**⚠️⚠️⚠️ Info in this section is stale ⚠️⚠️⚠️**:
  - **Problem 1** is resolved in PR [#2](https://github.com/stereobooster/typescript-monorepo/pull/2)
  - **Problem 2** is resolved in PR [#5](https://github.com/stereobooster/typescript-monorepo/pull/5)
  - **Problem 4** is resolved in PR [#4](https://github.com/stereobooster/typescript-monorepo/pull/4)

### yarn

`yarn` instead of `npm`, because it supports `workspaces` to link cross-dependencies.

Create `package.json` in the root without version because we not going to publish it and with `workspaces`:

```json
"workspaces": [
  "packages/*"
]
```

### lerna

We will use `lerna` to run commands across all packages and "elevate" common dependencies.

Create `lerna.json`:

```json
{
  "packages": ["packages/*"],
  "npmClient": "yarn",
  "useWorkspaces": true,
  "version": "0.0.1"
}
```

### TypeScript

We will use `typescript` to check types and compile TS down to desired JS files (ES5 or ES2015, CommonJS or ES modules).

Create `tsconfig.base.json`. This is what you need to add to enable monorepo:

```json
{
  "include": ["packages/*/src"],
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "baseUrl": ".",
    "paths": {
      "@stereobooster/*": ["packages/*/src"]
    }
  }
}
```

Create `packages/d/`, `packages/b/`, `packages/c/`, `packages/stories/`. Add `tsconfig.json` to each one:

```json
{
  "include": ["src"],
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    // to override config from tsconfig.base.json
    "outDir": "lib",
    "rootDir": "src",
    // for references
    "baseUrl": "src"
  },
  // references required for monorepo to work
  "references": [{ "path": "../d" }]
}
```

In `package.json` for packages `b` and `c` add:

```json
"peerDependencies": {
  "@stereobooster/d": "0.0.1"
},
"devDependencies": {
  "@stereobooster/d": "*"
}
```

We need `peerDependencies` to make sure that when packages (`d`, `b`, `c`) installed by the end user they will use the same instance of package `d`, otherwise, TypeScript can complain about incompatible types (especially if use inheritance and private fields). In `peerDependencies` we specify a version, but in `devDependencies` we don't need to, because we need simply to instruct `yarn` to use whatever version of package we have locally.

Now we can build projects. Add to root `package.json`:

```json
"scripts": {
  "build": "lerna run build --stream --scope=@stereobooster/{d,b,c}"
}
```

and to `package.json` for `d`, `b`, `c`

```json
"scripts": {
  "build": "tsc"
}
```

**Problem 1**: because of sub-dependencies (packages `b` and `c` depend on `d`, `stories` depends on `d`, `b`, `c`) we need to build packages accordingly, e.g. first `d`, second `b` and `c`, third `stories`. That is why we can't use `--parallel` flag for `lerna` for build command.

### React

Install `@types/react`, `@types/react-dom`, `react`, `react-dom`.

Add to `tsconfig.base.json`:

```json
"compilerOptions": {
  "lib": ["dom", "esnext"],
  "jsx": "react",
}
```

Add to subpackage's `package.json`:

```json
"peerDependencies": {
  "react": "^16.8.0",
  "react-dom": "^16.8.0"
}
```

### Jest

We will use `jest` to run tests. Install `@types/jest`, `@types/react-test-renderer`, `jest`, `react-test-renderer`. Add `jest.json`. To eanbale TypeScript:

```json
{
  "moduleFileExtensions": ["ts", "tsx", "js"],
  "transform": {
    "\\.tsx?$": "ts-jest"
  },
  "testMatch": ["**/__tests__/**/*.test.*"],
  "globals": {
    "ts-jest": {
      "tsConfig": "tsconfig.base.json"
    }
  }
}
```

to enable monorepo:

```json
"moduleNameMapper": {
  "@stereobooster/(.*)$": "<rootDir>/packages/$1"
}
```

As well we will need to change `tsconfig.base.json`, because [Jest doesn't support ES modules](https://github.com/facebook/jest/issues/4842):

```json
"compilerOptions": {
  "target": "es5",
  "module": "commonjs",
}
```

Add command to `package.json`

```json
"scripts": {
  "pretest": "yarn build",
  "test": "jest --config=jest.json"
}
```

~~**Problem 2**: we will publish modules as ES5 + CommonJS, which makes no sense for React package, which would require some kind of bundler to consume packages, like Parcel or Webpack.~~

**Problem 3**: there are sub-dependencies, so we need to build all packages first and only after we can run tests. That is why we need `pretest` script.

### Storybook

Install storybook according to [official instruction](https://storybook.js.org/docs/configurations/typescript-config/).

We will need the following things in `package.json`:

```json
"scripts": {
  "start": "start-storybook -p 8080",
  "build": "build-storybook -o dist"
},
"dependencies": {
  "@stereobooster/d": "*",
  "@stereobooster/b": "*",
  "@stereobooster/c": "*"
},
"devDependencies": {
  "@babel/core": "7.4.3",
  "@storybook/addon-info": "^5.0.11",
  "@storybook/addons": "5.0.6",
  "@storybook/core": "5.0.6",
  "@storybook/react": "5.0.6",
  "@types/storybook__addon-info": "^4.1.1",
  "@types/storybook__react": "4.0.1",
  "awesome-typescript-loader": "^5.2.1",
  "babel-loader": "8.0.5",
  "react-docgen-typescript-loader": "^3.1.0"
}
```

Create configurations in `.storybook` (again, based on official instruction). Now we can create stories in `/src/b` for `b` packages, in `/src/c` for `c` package.

Storybook will watch for changes in `stories/src`, but not for changes in `d/src`, `b/src`, `c/src`. We will need to use TypeScript to watch for changes in other packages.

Add to `package.json` of `d`, `b` and `c` packages:

```json
"scripts": {
  "start": "tsc -w"
}
```

and to the root `package.json`:

```json
"scripts": {
  "prestart": "yarn build",
  "start": "lerna run start --stream --parallel"
}
```

Now a developer can run `yarn start` (in one terminal) and `yarn test --watch` (in another terminal) to get development environment - scripts will watch for changes and reload.

**Problem 3**: there are sub-dependencies, so we need to build all packages first and only after we can run the start script. That is why we need `prestart` script.

~~**Problem 4**: If there is type error in stories it will show up in the browser, but if there is type error in `d`, `b` or `c` packages it will only show up in terminal, which spoils all DX, because instead of switching between editor and browser you will need to switch to terminal as well to check if there is an error or not.~~
