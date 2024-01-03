const fs = require('fs');
const path = require('path');

const logsDir = path.join(process.cwd(), 'logs');

function log({ name, data }) {
    let name = `${Date.now()}.json`;
    let file = fs.createWriteStream(path.join(logsDir, name), { flags: 'w' });
    file.write(JSON.stringify(data));
}

module.exports = { log };