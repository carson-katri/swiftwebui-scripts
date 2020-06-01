# swiftwebui-scripts
Scripts to make working with [SwiftWebUI and WASM](https://github.com/carson-katri/SwiftWebUI) easier.

# Getting Started

To make a new SwiftWebUI project, run:

```sh
npx carson-katri/swiftwebui-scripts my-app
```

Your project will be created in `my-app`.

Then, open the folder and run:

```sh
npm install
make
npm start
```

to build the project and start the webpack server.

Now just edit the embedded Swift project, and run `make` when you're ready to view the changes in your browser.
