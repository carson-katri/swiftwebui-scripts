const commandExists = require('command-exists');
const colors = require('colors');
const fetch = require('node-fetch');
const { exec } = require("child_process");
const install = require('./install');
const fs = require('fs').promises;
fs.existsSync = require('fs').existsSync;
const yesno = require('yesno');
const { paramCase } = require('param-case');

const platformReleases = {
    darwin: {
        name: 'swift-wasm-DEVELOPMENT-SNAPSHOT-2020-05-24-a',
        trimmedName: 'wasm-DEVELOPMENT-SNAPSHOT-2020-05-24-a',
        download_url: 'https://github.com/swiftwasm/swift/releases/download/swift-wasm-DEVELOPMENT-SNAPSHOT-2020-05-24-a/swift-wasm-DEVELOPMENT-SNAPSHOT-2020-05-24-a-osx.tar.gz'
    },
    linux: {
        name: 'swift-wasm-DEVELOPMENT-SNAPSHOT-2020-05-24-a',
        trimmedName: 'wasm-DEVELOPMENT-SNAPSHOT-2020-05-24-a',
        download_url: 'https://github.com/swiftwasm/swift/releases/download/swift-wasm-DEVELOPMENT-SNAPSHOT-2020-05-24-a/swift-wasm-DEVELOPMENT-SNAPSHOT-2020-05-24-a-linux.tar.gz'
    }
}

const create = (name) => {
    const path = `${process.cwd()}/${paramCase(name)}`;
    console.log(`Creating new SwiftWebUI app in ${path.green.bold}\n`);
    const release = platformReleases[process.platform];
    if (release == undefined) {
        console.log(`Unknown platform ${process.platform.bold}`.red);
        process.exit(1);
    }
    commandExists('swiftenv')
    .then(swiftenv => {
        exec(`${swiftenv} versions`, (err, out, stdErr) => {
            if (err != null) {
                console.error(err);
                process.exit(1);
            } else {
                if (out.indexOf(release.trimmedName) != -1) init(name, path, release.trimmedName);
                else install(name, path, release).then(_ => init(name, path, release.trimmedName));
            }
        });
    })
    .catch(err => {
        console.log("You do not have swiftenv installed.".red);
        console.log("It is required to run your project. Please install it from https://github.com/kylef/swiftenv");
    });
}

const init = async (name, path, release) => {
    console.log(`Using SwiftWASM release ${release.cyan}\n`);
    if (fs.existsSync(path)) {
        console.log(`The folder at ${path.cyan} already exists.`);
        const ok = await yesno({
            question: 'Use this directory anyways? (y/n)'
        });
        if (!ok) {
            process.exit(1);
        }
    } else {
        await fs.mkdir(path);
    }
    await fs.writeFile(`${path}/package.json`, JSON.stringify(makePackageJSON(name), null, 4));
    await fs.copyFile(`${__dirname}/resources/webpack.config.js`, `${path}/webpack.config.js`);

    await fs.writeFile(`${path}/.swift-version`, release);

    if (!fs.existsSync(`${path}/src`)) await fs.mkdir(`${path}/src`);
    await fs.copyFile(`${__dirname}/resources/index.js`, `${path}/src/index.js`);

    if (!fs.existsSync(`${path}/public`)) await fs.mkdir(`${path}/public`);
    await fs.writeFile(`${path}/public/index.html`, makeHTML(name));
    
    if (!fs.existsSync(`${path}/dist`)) await fs.mkdir(`${path}/dist`);
    await fs.writeFile(`${path}/Makefile`, makeMakefile(name));

    if (!fs.existsSync(`${path}/${name}`)) await fs.mkdir(`${path}/${name}`);
    exec(`swift package init --type executable`, { cwd: `${path}/${name}` }, async (_, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        await fs.writeFile(`${path}/${name}/Package.swift`, makePackageSwift(name));
        await fs.writeFile(`${path}/${name}/Sources/${name}/main.swift`, starterCode);
        console.log('Your project is ready!'.green.bold, '\nThe entry point for your app is in', `${path}/${name}/Sources/${name}/main.swift\n`.cyan.bold);
        console.log('npm install'.green.bold, 'to finish setting up the project.');
        console.log('Start the server with', 'npm start'.green.bold);
        console.log("When you've made a change to the Swift source code, run", 'make'.green.bold);
    });
}

const makePackageJSON = (name) => ({
    "name": paramCase(name),
    "version": "1.0.0",
    "dependencies": {
        "@wasmer/wasi": "^0.9.1",
        "@wasmer/wasmfs": "^0.9.1",
        "javascript-kit-swift": "^0.3.0"
    },
    "devDependencies": {
        "webpack": "^4.42.0",
        "webpack-cli": "^3.3.11",
        "webpack-dev-server": "^3.10.3"
    },
    "scripts": {
        "build": "webpack",
        "start": "webpack-dev-server"
    },
    "license": "MIT"
});

const makeMakefile = (name) => `build:
\tcd ${name} && \\
\tswift build --triple wasm32-unknown-wasi && \\
\tcp .build/debug/${name} ../dist/SwiftWASM.wasm`;

const makePackageSwift = (name) => `// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "${name}",
    products: [
        .executable(name: "${name}", targets: ["${name}"])
    ],
    dependencies: [
        .package(url: "https://github.com/carson-katri/SwiftWebUI", .branch("develop")),
    ],
    targets: [
        .target(
            name: "${name}",
            dependencies: ["SwiftWebUI"]),
        .testTarget(
            name: "${name}Tests",
            dependencies: ["${name}"]),
    ]
)`;

const makeHTML = (name) => `<!doctype html>
<html>
  <head>
    <title>${name}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css" integrity="sha256-9mbkOfVho3ZPXfM7W8sV2SndrGDuh7wuyLjtsWeTI1Q=" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/components/icon.min.css" integrity="sha256-KyXPF3/VOPPst/NQOzCWr97QMfSfzJLyFT0o5lYJXiQ=" crossorigin="anonymous" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <div id="page-root"></div>
    <script src="main.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.js" />
  </body>
</html>`;

const starterCode = `import SwiftWebUI
SwiftWebUI.serve(Text("Hello, world!"))`;

module.exports = {
    create,
    init
}