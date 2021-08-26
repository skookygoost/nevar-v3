const Command = require('../../structure/Command')
    , { MessageEmbed } = require('discord.js')
    , ms = require('ms')
    , reply = require('../../helper/simpleReply');

class Autodelete extends Command {

    constructor(client) {
        super(client, {
            name: "autodelete",
            dirname: __dirname,
            memberPermissions: ["MANAGE_GUILD"],
            premium: true,
            cooldown: 2000,
            slashCommand: {
                addCommand: true,
                description: "administration/autodelete:description",
                options: [
                    {
                        name: "administration/autodelete:slashOption1",
                        description: "administration/autodelete:slashOption1Desc",
                        type: "STRING",
                        required: true,
                        choices: [
                            {
                                name: "administration/autodelete:slashOption1Choice1",
                                value: "set"
                            },
                            {
                                name: "administration/autodelete:slashOption1Choice2",
                                value: "reset"

                            },
                        ]

                    },
                    {
                        name: "administration/autodelete:slashOption2",
                        description: "administration/autodelete:slashOption2Desc",
                        type: "CHANNEL",
                        required: true,
                    },
                    {
                        name: "administration/autodelete:slashOption3",
                        description: "administration/autodelete:slashOption3Desc",
                        type: "STRING",
                        required: false,
                    }
                ]
            }
        });
    }

    async run(interaction, message, args, data) {
        let guild = message?.guild || interaction?.guild;
        if (!args[0]) {
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/autodelete:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("administration/autodelete:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return reply.message(message, embed);
            if (interaction) return reply.interaction(interaction, embed);
        }
        if (args[0].toLowerCase() === 'set') {
            let channel = guild.channels.cache.filter(ch => ch.type === 'GUILD_TEXT').get(args[1]);
            if (message) channel = message.mentions.channels.filter((ch) => ch.type === "GUILD_TEXT" || ch.type === "GUILD_NEWS" && ch.guild.id === message.guild.id).first();
            if (channel) {
                if(!args[2]){
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autodelete:usage")
                                .replace('{prefix}', data.guild.prefix)
                                .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                            guild.translate("administration/autodelete:example")
                                .replace('{prefix}', data.guild.prefix)
                                .replace('{emotes.example}', this.client.emotes.example))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return reply.message(message, embed);
                    if (interaction) return reply.interaction(interaction, embed);
                }
                if (isNaN(ms(args[2]))) {
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autodelete:usage")
                                .replace('{prefix}', data.guild.prefix)
                                .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                            guild.translate("administration/autodelete:example")
                                .replace('{prefix}', data.guild.prefix)
                                .replace('{emotes.example}', this.client.emotes.example))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return reply.message(message, embed);
                    if (interaction) return reply.interaction(interaction, embed);
                } else {
                    if(ms(args[2]) > ms('7d')){
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/autodelete:maxTime")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        if (message) return reply.message(message, embed);
                        if (interaction) return reply.interaction(interaction, embed);
                    }
                    if(data.guild.autoDeleteChannels.length > 10){
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/autodelete:maxChannels")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        if (message) return reply.message(message, embed);
                        if (interaction) return reply.interaction(interaction, embed);
                    }

                    for(let val of data.guild.autoDeleteChannels){
                        if(val.split(' | ')[0] === channel.id){
                            data.guild.autoDeleteChannels = data.guild.autoDeleteChannels.filter((ch) => ch !== val)
                        }
                    }

                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autodelete:set")
                            .replace('{emotes.success}', this.client.emotes.success)
                            .replace('{channel}', channel)
                            .replace('{time}', args[2]))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) await reply.message(message, embed);
                    if (interaction) await reply.interaction(interaction, embed);
                    await this.client.wait(500);
                    data.guild.autoDeleteChannels.push(`${channel.id} | ${ms(args[2])}`);
                    await data.guild.save();

                }

            }else{
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/autodelete:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/autodelete:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return reply.message(message, embed);
                if (interaction) return reply.interaction(interaction, embed);
            }
        }else if(args[0].toLowerCase() === 'reset'){
            if(!args[1]){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/autodelete:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/autodelete:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return reply.message(message, embed);
                if (interaction) return reply.interaction(interaction, embed);
            }
            if(args[1].toLowerCase() === 'all'){
                let bool;
                if(data.guild.autoDeleteChannels.length >= 1){
                    data.guild.autoDeleteChannels = [];
                    data.guild.markModified("autoDeleteChannels");
                    await data.guild.save();
                    bool = true;
                }
                if(bool){
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autodelete:resettedAll")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) await reply.message(message, embed);
                    if (interaction) await reply.interaction(interaction, embed);
                }else{
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autodelete:noAutodelete")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) await reply.message(message, embed);
                    if (interaction) await reply.interaction(interaction, embed);
                }
            }else{
                let channel = guild.channels.cache.filter(ch => ch.type === 'GUILD_TEXT').get(args[1]);
                if (message) channel = message.mentions.channels.filter((ch) => ch.type === "GUILD_TEXT" || ch.type === "GUILD_NEWS" && ch.guild.id === message.guild.id).first();
                if(channel){
                    for(let val of data.guild.autoDeleteChannels){
                        if(val.split(' | ')[0] === channel.id){
                            data.guild.autoDeleteChannels = data.guild.autoDeleteChannels.filter((ch) => ch !== val);
                            await data.guild.save();
                            let embed = new MessageEmbed()
                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                .setDescription(guild.translate("administration/autodelete:resettedChannel")
                                    .replace('{emotes.success}', this.client.emotes.success)
                                    .replace('{channel}', channel))
                                .setColor(this.client.embedColor)
                                .setFooter(data.guild.footer);
                            if (message) await reply.message(message, embed);
                            if (interaction) await reply.interaction(interaction, embed);
                        }
                    }
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autodelete:noAutodeleteInChannel")
                            .replace('{emotes.error}', this.client.emotes.error)
                            .replace('{channel}', channel))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) await reply.message(message, embed);
                    if (interaction) await reply.interaction(interaction, embed);
                }else{
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autodelete:usage")
                                .replace('{prefix}', data.guild.prefix)
                                .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                            guild.translate("administration/autodelete:example")
                                .replace('{prefix}', data.guild.prefix)
                                .replace('{emotes.example}', this.client.emotes.example))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return reply.message(message, embed);
                    if (interaction) return reply.interaction(interaction, embed);
                }
            }
        }
    }
}

module.exports = Autodelete;

