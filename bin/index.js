#!/usr/bin/env node

const { program } = require('commander');
const { create } = require('../lib/create');
const packagejson = require('../package.json');

program.version(packagejson.version);

program
    .command('create <name>')
    .option('-O0', 'Disable optimization for the project.', false)
    .description('Create a new SwiftWebUI project.')
    .action(create);

program.parse(process.argv);