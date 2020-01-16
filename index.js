#!/usr/bin/env node --experimental-modules

import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import { directoryExists } from './lib/files.js';
import { getStoredGitGubToken, setGithubCredentials, registerNewToken, githubAuth } from './lib/github.js';
import { createGitIgnore, createRemoteRepo, setupRepo} from './lib/repo.js';

clear();

console.log(
    chalk.yellow(
        figlet.textSync('cmdCoRE', { horizontalLayout: 'full'})
    )
);

if (directoryExists('.git')) {
    console.log(chalk.red('Already a Git repository!'));
    process.exit();
}

async function getGithubToken() {
    let token = getStoredGitGubToken();
    if (token) {
        return token;
    }

    await setGithubCredentials();
    token = await registerNewToken();
    return token;
};

async function run() {
    try {
        const token = await getGithubToken();
        githubAuth(token);

        const url = await createRemoteRepo();
        await createGitIgnore();
        await setupRepo(url);
        console.log(chalk.green('All done!'));
    } catch (err) {
        if (err) {
            switch (err.status) {
                case 401:
                  console.log(chalk.red('Couldn\'t log you in. Please provide correct credentials/token.'));
                  break;
                case 422:
                  console.log(chalk.red('There already exists a remote repository with the same name'));
                  break;
                default:
                  console.log(err);
            }
        }
    }
};

run();