const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const files = require('./lib/files');
// const inquirer = require('./lib/inquirer');
const github = require('./lib/github');
const repo = require('./lib/repo');

clear();

console.log(
    chalk.yellow(
        figlet.textSync('Ginit', { horizontalLayout: 'full'})
    )
);

if (files.directoryExists('.git')) {
    console.log(chalk.red('Already a Git repository!'));
    process.exit();
}

// const run = async () => {
//     const credentials = await inquirer.askGithubCredentials();
//     console.log(credentials);
// };

const getGithubToken = async () => {
    let token = github.getStoredGitGubToken();
    if (token) {
        return token;
    }

    await github.setGithubCredentials();
    token = await github.registerNewToken();
    return token;
};

const run = async() =>  {
    try {
        const token = await getGithubToken();
        github.githubAuth(token);

        const url = await repo.createRemoteRepo();
        await repo.createGitIgnore();
        await repo.setupRepo(url);
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