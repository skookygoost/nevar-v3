require('./helper/extenders');
require('./helper/simpleReply');


const util = require('util')
    , fs = require('fs')
    , mongoose = require('mongoose')
    , Discord = require('discord.js')
    , Nevar = require('./structure/Nevar')
    , config = require('../config.json')
    , readdir = util.promisify(fs.readdir);

const client = new Nevar({
    intents:
        Discord.Intents.FLAGS.GUILD_MEMBERS |
        Discord.Intents.FLAGS.GUILD_PRESENCES |
        Discord.Intents.FLAGS.GUILDS |
        Discord.Intents.FLAGS.GUILD_MESSAGES,
    partials: Object.values(Discord.Constants.PartialTypes),
    restTimeOffset: 200,
    allowedMention: {
        parse: ["users"]
    }
});


module.exports.client = client;
module.exports.__baseDir = __dirname;

const init = async () => {

    // Load directories
    const directories = await readdir("./src/commands/");
    client.logger.log(`Loaded ${directories.length} categories`, "debug");

    // Load commands
    for(let directory of directories){
        const commands = await readdir('./src/commands/' + directory + '/');
        commands.forEach((cmd) => {
            if(cmd.split('.')[1] === 'js'){
                let response = client.loadCommand('../commands/'+directory, cmd);
                if(response) client.logger.log(response, 'error')
            }
        })
    }

    // Load player events
    const playerFiles = await fs.readdirSync('./src/player/');
    for(let file of playerFiles){
        const playerEvent = require('./player/'+file)
        client.player.on(file.split('.')[0], playerEvent.bind(null, client))
    }
    client.logger.log(`Loaded ${playerFiles.length} player events`, "debug")

    // Load discord events

    const evtFiles = await readdir("./src/events/");
    client.logger.log(`Loaded ${evtFiles.length} events`, "debug");
    for(let file of evtFiles){
        let eventName = file.split('.')[0];
        let event = new (require('./events/'+file))(client);
        client.on(eventName, (...args) => event.run(...args));
    }

    // Login
    client.login(config.bot_token);

    // Connect to mongodb
    mongoose
        .connect(config.mongoDB_url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            client.logger.log('Successfully connected to MongoDB', 'success');
        })
        .catch((err) => {
            client.logger.log('Couldn\'t connect to MongoDB: ' + err, 'error');
        });

    const languages = require('./helper/languages.js');
    client.translations = await languages();
};

// Init
init().then(res => {
    if(!res) client.logger.log("Successfully initiated client", "success");
}).catch((err) => {
    client.logger.log("Failed to initiate client: " + err, "error");
});
