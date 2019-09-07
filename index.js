const watcher = require('./word-watcher-bot');

watcher.invoke()
    .then(console.log)
    .catch((err) => console.log(`ERR: ${err}`));