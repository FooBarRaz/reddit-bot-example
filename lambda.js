const bot = require('./bot);

exports.handler = async (event, context) => {
    return context.succeed(await bot.invoke());
};
