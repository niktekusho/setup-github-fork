const gitInfo = require('hosted-git-info');
const git = require('simple-git/promise');

const signale = require('signale');

function isNullOrUndefined(obj) {
	return obj === null || obj === undefined;
}

async function app(input, options) {
	console.log(`Input received: ${input}`);
	console.log(`Options received: ${options}`);

	// Throw if the current dir is already a git repository
	if (await git().checkIsRepo()) {
		throw new Error('The directory in which this application is running is already a git repository.')
	}

	if (input.length === 0) {
		throw new Error('At least one (1) repository URL must be specified.');
	}

	if (input.length > 1) {
		// TODO
		throw new Error('Only one (1) repository URL must be specified.');
	}

	const userGitUsername = options.gitUsername;
	if (isNullOrUndefined(userGitUsername)) {
		throw new Error('In order to setup a fork, you need to specify your git username.');
	}

	const inputRepo = input[0];

	const inputRepoInfo = gitInfo.fromUrl(inputRepo);

	if (isNullOrUndefined(inputRepoInfo)) {
		throw new Error('Could not find info for the specified git URL.');
	}

	if (inputRepoInfo.type !== 'github') {
		// TODO
		throw new Error('This application only supports GitHub for the moment.');
	}

	// Rename the original remote to 'upstream'
	await git().clone(inputRepo, ['--origin', 'upstream']);

	const clonedRepo = git(inputRepoInfo.project);

	const remoteFork = inputRepoInfo.https({
		noGitPlus: true
	}).replace(inputRepoInfo.user, userGitUsername);

	console.log(remoteFork);

	await clonedRepo.addRemote('origin', remoteFork);
}

module.exports = app;
