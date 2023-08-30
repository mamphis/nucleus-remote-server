const dotenv = require('dotenv');
const { Client } = require('basic-ftp');

dotenv.configDotenv();
console.log(process.cwd());

const host = process.env.FTP_SERVER;
const user = process.env.FTP_USER;
const password = process.env.FTP_PASSWORD;
const rootDir = process.env.FTP_ROOT;

const client = new Client();
async function upload() {
    await client.access({
        host,
        user,
        password,
    });

    await client.cd(rootDir);
    await client.uploadFromDir('./dist');
    client.close();
}

upload();