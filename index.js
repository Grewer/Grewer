const path = require('path');

require("dotenv").config();

const Octokit = require("@octokit/rest");

const {
    GIST_ID: gistId,
    GH_TOKEN: githubToken,
} = process.env;

console.log('githubToken',githubToken)

const octokit = new Octokit({auth: `token ${githubToken}`});

// octokit.repos.createOrUpdateFile()
const main = async ()=>{
   const readme = await octokit.repos.getReadme({
        owner: 'grewer',
        repo: 'grewer',
    });

    console.log(readme)
}



main()
