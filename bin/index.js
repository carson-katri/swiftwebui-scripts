#!/usr/bin/env node

const { program } = require('commander');
const { create } = require('../lib/create');
const packagejson = require('../package.json');

program.version(packagejson.version);

program
    .command('create <name>')
    .description('Create a new SwiftWebUI project.')
    .action(create);

program.parse(process.argv);