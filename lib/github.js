const CLI = require('clui');
const Configstore = require('configstore');
const Octokit = require("@octokit/rest");
const Spinner = CLI.Spinner;

const inquirer = require('./inquirer');
const pkg = require('../package.json');

const conf = new Configstore(pkg.name);

let octokit;
const status = new Spinner('Authenticating you, please wait...');

module.exports = {
    getInstance: () => {
        return octokit
    },
    getStoredGitGubToken: () => {
        return conf.get('github.token');
    },
    setGithubCredentials: async () => {
        const credentials = await inquirer.askGithubCredentials();
        octokit = new Octokit({
            auth: {
                username: credentials.username,
                password: credentials.password,
                async on2fa() {
                    status.stop()
                    const otp = await inquirer.askOtp();
                    status.start()
                    return otp.otp
                }
            }
        });
    },
    registerNewToken: async () => {
        status.start();

        try {
            const response = await octokit.oauthAuthorizations.createAuthorization({
                scopes: ['user', 'public_repo', 'repo', 'repo:status'],
                note: 'ginit, the command-line tool for initializing git repos',
            });
            const token = response.data.token;

            if (token) {
                conf.set('github.token', token);
                return token;
            } else {
                throw new Error("Missing Token", "Github token was not found in the response");
            }
        } catch (err) {
            console.log(err);
            // throw err;
        } finally {
            status.stop();
        }
    },
    githubAuth: (token) => {
        octokit = new Octokit({
            auth: token
        });
    }
}