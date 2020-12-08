const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function status() {
    const command = `sudo asterisk -rx "sip show registry" | awk -F ' ' '{ print $5 }' | xargs`
    const { stdout } = await exec(command);

    const state = stdout.split(' ')[1].split('\n')[0]

    return state
}

module.exports = {
    status
}