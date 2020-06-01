# swiftwebui-scripts
Scripts to make working with [SwiftWebUI and WASM](https://github.com/carson-katri/SwiftWebUI) easier.

# Getting Started

To make a new SwiftWebUI project, run:

```sh
npx carson-katri/swiftwebui-scripts create MyApp
```
(use your Swift project naming scheme, not a node dash case. We'll convert it for you)

Your project will be created in `my-app`.

Then, open the folder and run:

```sh
npm install
make
npm start
```

to build the project and start the webpack server.

Now just edit the embedded Swift project, and run `make` when you're ready to view the changes in your browser.
