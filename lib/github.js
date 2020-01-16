import clui from 'clui';
import Configstore from 'configstore';
import Octokit from '@octokit/rest';
import { askGithubCredentials, askOtp } from './inquirer.js';

const conf = new Configstore('ginit');

let octokit;
const status = new clui.Spinner('Authenticating you, please wait...');

export function getInstance() {
    return octokit
}

export function getStoredGitGubToken() {
    return conf.get('github.token');
}

export async function setGithubCredentials() {
    const credentials = await askGithubCredentials();
    octokit = new Octokit({
        auth: {
            username: credentials.username,
            password: credentials.password,
            async on2fa() {
                status.stop()
                const otp = await askOtp();
                status.start()
                return otp.otp
            }
        }
    });
}

export async function registerNewToken() {
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
}

export function githubAuth(token) {
    octokit = new Octokit({
        auth: token
    });
}