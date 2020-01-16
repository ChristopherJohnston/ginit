import clui from 'clui';
import fs from 'fs';
import simplegit  from 'simple-git/promise.js';
import _ from 'lodash';
import { askRepoDetails, askIgnoreFiles } from './inquirer.js';
import { getInstance } from './github.js';
import touch from 'touch';

const git = simplegit();

export async function createRemoteRepo() {
    const github = getInstance();
    const answers = await askRepoDetails();

    const data = {
        name: answers.name,
        description: answers.description,
        private: (answers.visibility === 'private')
    };

    const status = new clui.Spinner('Creating remote repository...');
    status.start();

    try {
        const response = await github.repos.createForAuthenticatedUser(data);
        return response.data.ssh_url;
    } catch (err) {
        throw err;
    } finally {
        status.stop();
    }
}

export async function createGitIgnore() {
    const filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');
    if (filelist.length) {
        const answers = await askIgnoreFiles(filelist);

        if (answers.ignore.length) {
            fs.writeFileSync( '.gitignore', answers.ignore.join('\n'));
        } else {
            touch('.gitignore');
        }
    } else {
        touch('.gitignore');
    }
}

export async function setupRepo(url) {
    const status = new clui.Spinner('Initializing local repository and pushing to remote...');
    status.start()

    return git.init()
        .then(git.add('.gitignore'))
        .then(git.add('./*'))
        .then(git.commit('Initial commit'))
        .then(git.addRemote('origin', url))
        .then(git.push('origin', 'master'))
        .finally(status.stop());
}
