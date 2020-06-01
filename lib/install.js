const { init } = require('./create');
const { exec } = require("child_process");

module.exports = (name, path, release) => {
    return new Promise((resolve, reject) => {
        console.log(`Installing SwiftWASM release ${release.name.cyan.bold} via`, 'swiftenv'.green.bold);
        console.log('It may take a few minutes to download the binary...');
        exec(`swiftenv install ${release.download_url}`, (err, out, stdErr) => {
            if (err != null) {
                console.log(err);
                reject(err);
            } else {
                console.log(out);
                console.log(stdErr);
                resolve();
            }
        });
        resolve();
    });
};