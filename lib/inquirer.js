const inquirer = require('inquirer');
const files = require('./files');

module.exports = {
    askOtp: () => {
        const questions = [
            {
                name: 'otp',
                type: 'input',
                message: 'Enter your One Time Password:',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return "Please enter your One Time Password";
                    }
                }
            }
        ]
        return inquirer.prompt(questions);
    },
    askGithubCredentials: () => {
        const questions = [
            {
                name: 'username',
                type: 'input',
                message: 'Enter your GitHub username or email address:',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return "Please enter your username or email address";
                    }
                }
            },
            {
                name: 'password',
                type: 'password',
                message: 'Enter your GitHub password:',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return "Please enter your password";
                    }
                }
            }
        ];

        return inquirer.prompt(questions);
    },
    askRepoDetails: () => {
        const argv = require('minimist')(process.argv.slice(2));

        const questions = [
            {
                type: 'input',
                name: 'name',
                message: 'Enter a name for the repository:',
                default: argv._[0] || files.getCurrentDirectoryBase(),
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter a name for the repository.';
                    }
                }
            },
            {
                type: 'input',
                name: 'description',
                message: 'Optionally enter a description of the repository:',
                default: argv._[1] || null,                
            },
            {
                type: 'list',
                name: 'visibility',
                message: 'Public or Private:',
                choices: ['public', 'private'],
                default: 'public'
            }
        ];
        return inquirer.prompt(questions);
    },
    askIgnoreFiles: (filelist) => {
        const questions = [
            {
                type: 'checkbox',
                name: 'ignore',
                message: 'Select the files and/or folders you wish to ignre:',
                choices: filelist,
                default: ['node_modules', 'bower_components']
            }
        ];
        return inquirer.prompt(questions);
    }
};