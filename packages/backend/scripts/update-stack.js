// Make a post request to the url stored in process.env.PORTAINER_STACK_WEBHOOK
// Use buildin nodejs fetch
// load env variables from .env file

require('dotenv').config();
const { Agent, request } = require('https');

const start = async () => {
    const url = process.env.PORTAINER_STACK_WEBHOOK;
    // Check if portainer url is set
    if (!url) {
        console.error('PORTAINER_STACK_WEBHOOK is not set');
        return;
    }

    // check if portainer url starts with https
    if (!url.startsWith('https')) {
        console.error('PORTAINER_STACK_WEBHOOK must start with https');
        return;
    }

    console.log('PORTAINER_STACK_WEBHOOK:', url);

    // make a post request using the https request method and using the agent
    const req = request(url, {
        method: 'POST',
        rejectUnauthorized: false,
    }, (response) => {
        console.log('Status Code:', response.statusCode);
        response.on('data', chunk => process.stdout.write(chunk));
        response.on('end', () => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                console.log('Success');
            } else {
                console.error('Error');
            }
        });
    });
    req.on('error', error => console.error(error));
    req.end();
}

start();