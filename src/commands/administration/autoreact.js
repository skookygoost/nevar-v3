const Command = require('../../core/command')
    , Discord = require('discord.js')
    , { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js')
const {SlashCommandBuilder} = require("@discordjs/builders");
const Resolver = require("../../helper/finder");

//autoreact add <channel> <emote> | remove <channel> <emote> | list <channel> | reset <channel>

class Autoreact extends Command {
    constructor(client) {
        super(client, {
            name: "autoreact",
            description: "administration/autoreact:general:description",
            dirname: __dirname,
            memberPermissions: ["MANAGE_GUILD"],
            premium: true,
            cooldown: 2000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder(),
            }
        });
    }
    async run(interaction, message, args, data){

        if(!data.guild.plugins?.autoReact) {
            data.guild.plugins.autoReact = [];
            data.guild.markModified("plugins.autoReact");
            await data.guild.save();
        }
        const guild = message?.guild || interaction?.guild;
        const channel = message?.channel || interaction?.channel;
        const member = message?.member || interaction?.member;

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("language:collectors:action")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        let id = message?.member?.user?.id || interaction?.member?.user?.id
        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('autoreact_' + id + '_add')
                    .setLabel(guild.translate("administration/autoreact:main:actions:1"))
                    .setEmoji('➕')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('autoreact_' + id + '_list')
                    .setLabel(guild.translate("administration/autoreact:main:actions:2"))
                    .setEmoji('📝')
                    .setDisabled(data.guild.plugins.autoReact.length === 0)
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('autoreact_' + id + '_remove')
                    .setLabel(guild.translate("administration/autoreact:main:actions:3"))
                    .setEmoji('➖')
                    .setDisabled(data.guild.plugins.autoReact.length === 0)
                    .setStyle('DANGER'),
            )
        let sent;
        if (message) sent = await message.send(embed, false, [row]);
        if (interaction) sent = await interaction.send(embed, false, [row]);

        const filter = i => i.customId.startsWith('autoreact_' + id) && i.user.id === id;

        const clicked = await sent.awaitMessageComponent({filter, time: 120000}).catch(() => {})

        if (clicked) {
            if (clicked.customId === 'autoreact_' + id + '_add') {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("language:collectors:channel")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                await clicked.update({embeds: [embed], components: []});
                const collectMessage = channel.createMessageCollector(
                    {
                        filter: m => m.author.id === member.user.id,
                        time: 120000
                    }
                );
                collectMessage.on("collect", async (msg) => {
                    collectMessage.stop();
                    msg.delete().catch(() => {});
                    let channelSent = await Resolver.resolveChannel({
                        message: msg,
                        search: msg.content,
                        channelType: 'GUILD_TEXT',
                    });

                    if(channelSent){
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("administration/autoreact:main:collectors:emoji")
                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        sent.edit({embeds:[embed]})

                        const collectMessage = channel.createMessageCollector(
                            {
                                filter: m => m.author.id === member.user.id,
                                time: 120000
                            }
                        );
                        collectMessage.on("collect", async (msg) => {
                            collectMessage.stop();
                            msg.delete().catch(() => {});

                            let emote = Discord.Util.parseEmoji(msg.content);
                            let push;
                            if(emote?.id){
                                push = emote.id;
                            }else{
                                let regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
                                if(regex.test(msg.content)) {
                                    push = msg.content;
                                }
                            }

                            if(push){
                                for(let val of data.guild.plugins?.autoReact){
                                    if(val === channelSent.id + ' | ' + push){
                                        data.guild.plugins.autoReact = data.guild.plugins.autoReact.filter((value) => value !== val);
                                    }
                                }
                                if(data.guild.plugins.autoReact.length > 40){
                                    let embed = new MessageEmbed()
                                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                        .setDescription(guild.translate("administration/autoreact:main:errors:toMany")
                                            .replace('{emotes.error}', this.client.emotes.error))
                                        .setColor(this.client.embedColor)
                                        .setFooter({text: data.guild.footer});
                                    if (message) return sent.edit({embeds:[embed]});
                                    if (interaction) return sent.edit({embeds:[embed]});
                                }
                                data.guild.plugins.autoReact.push(channelSent.id + ' | ' + push);
                                data.guild.markModified("plugins.autoReact");
                                await data.guild.save();
                                let embed = new MessageEmbed()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("administration/autoreact:main:added")
                                        .replace('{emotes.success}', this.client.emotes.success))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                if (message) return sent.edit({embeds:[embed]});
                                if (interaction) return sent.edit({embeds:[embed]});
                            }else{
                                let embed = new MessageEmbed()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("administration/autoreact:main:errors:invalidEmoji")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                if (message) return sent.edit({embeds:[embed]});
                                if (interaction) return sent.edit({embeds:[embed]});
                            }
                        })
                    }else{
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("language:invalid:channel")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        if (message) return sent.edit({embeds:[embed]});
                        if (interaction) return sent.edit({embeds:[embed]});
                    }
                });

            }
            if (clicked.customId === 'autoreact_' + id + '_list') {
                let unsortedAutoreact = [];
                for (let val of data.guild.plugins?.autoReact) {
                    let channel = val.split(" | ")[0]
                    if (val.startsWith(channel)) {
                        let id = val.split(" | ")[1]
                        let emote = await this.client.emojis.cache.find(emoji => emoji.id === id);
                        if (emote) {
                            unsortedAutoreact.push(`<#${channel}> | ` + `${emote.animated ? `<a:${emote.name}:${emote.id}>` : `<:${emote.name}:${emote.id}>`}`)
                        } else {
                            let emoji = val.split(' | ')[1]
                            unsortedAutoreact.push(`<#${channel}> | ` + `${emoji}`)
                        }
                    }

                }
                let sortedAutoreact = [];
                for(let item of unsortedAutoreact) {
                    let channel = item.split(" | ")[0];
                    let emote = item.split(" | ")[1];
                    if(sortedAutoreact[channel]) {
                        sortedAutoreact[channel].push(emote);
                        continue;
                    }
                    sortedAutoreact[channel] = [emote];
                }
                let beautifiedAutoreact = [];
                let i = 0;
                for(let val of Object.keys(sortedAutoreact)) {
                    beautifiedAutoreact.push(`${Object.keys(sortedAutoreact)[i]} **»** ${sortedAutoreact[Object.keys(sortedAutoreact)[i]].join(", ")}`)
                    i++
                }

                if(beautifiedAutoreact.length < 1) beautifiedAutoreact = [guild.translate("language:noEntries")];

                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("administration/autoreact:main:list")
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{emotes.success}', this.client.emotes.success)
                        .replace('{list}', beautifiedAutoreact.join("\n" + this.client.emotes.arrow)))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                if (message) return clicked.update({embeds:[embed], components: []});
                if (interaction) return clicked.update({embeds:[embed], components: []});
            }
            if (clicked.customId === 'autoreact_' + id + '_remove') {

                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("language:collectors:channel")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                await clicked.update({embeds: [embed], components: []});
                const collectMessage = channel.createMessageCollector(
                    {
                        filter: m => m.author.id === member.user.id,
                        time: 120000
                    }
                );
                collectMessage.on("collect", async (msg) => {
                    collectMessage.stop();
                    msg.delete().catch(() => {});
                    let channelSent = await Resolver.resolveChannel({
                        message: msg,
                        search: msg.content,
                        channelType: 'GUILD_TEXT',
                    });

                    if(channelSent){
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("administration/autoreact:main:collectors:emoji")
                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        sent.edit({embeds:[embed]})

                        const collectMessage = channel.createMessageCollector(
                            {
                                filter: m => m.author.id === member.user.id,
                                time: 120000
                            }
                        );
                        collectMessage.on("collect", async (msg) => {
                            collectMessage.stop();
                            msg.delete().catch(() => {});

                            let emote = Discord.Util.parseEmoji(msg.content);
                            let push;
                            if(emote?.id){
                                push = emote.id;
                            }else{
                                let regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
                                if(regex.test(msg.content)) {
                                    push = msg.content;
                                }
                            }

                            if(push){
                                for(let val of data.guild.plugins?.autoReact){
                                    if(val === channelSent.id + ' | ' + push){
                                        data.guild.plugins.autoReact = data.guild.plugins.autoReact.filter((value) => value !== val);
                                    }
                                }
                                data.guild.markModified("plugins.autoReact");
                                await data.guild.save();

                                let embed = new MessageEmbed()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("administration/autoreact:main:removed")
                                        .replace('{emotes.success}', this.client.emotes.success))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                if (message) return sent.edit({embeds:[embed]});
                                if (interaction) return sent.edit({embeds:[embed]});
                            }else{
                                let embed = new MessageEmbed()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("administration/autoreact:main:errors:invalidEmoji")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                if (message) return sent.edit({embeds:[embed]});
                                if (interaction) return sent.edit({embeds:[embed]});
                            }
                        })
                    }else{
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("language:invalid:channel")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        if (message) return sent.edit({embeds:[embed]});
                        if (interaction) return sent.edit({embeds:[embed]});
                    }
                });


            }
        }

        return;

        if(args[0].toLowerCase() === 'remove'){
            let channel = guild.channels.cache.filter(ch => ch.type === 'GUILD_TEXT').get(args[1]);
            if (message) channel = message.mentions.channels.filter((ch) => ch.type === "GUILD_TEXT" || ch.type === "GUILD_NEWS" && ch.guild.id === message.guild.id).first();
            if(channel){
                if(!args[2]){
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autoreact:usage")
                                .replace('{prefix}', data.guild.prefix)
                                .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                            guild.translate("administration/autoreact:example")
                                .replace('{prefix}', data.guild.prefix)
                                .replace('{emotes.example}', this.client.emotes.example)
                                .replace('{channel}', message?.channel?.name || interaction?.channel?.name))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return reply.message(message, embed);
                    if (interaction) return reply.interaction(interaction, embed);
                }else{
                    let emote = Discord.Util.parseEmoji(args[2]);
                    if(emote.id){
                        if(data.guild.autoReactChannels.includes(`${channel.id} | ${emote.id}`)){
                            for(let val of data.guild.autoReactChannels){
                                if(val === `${channel.id} | ${emote.id}`) {
                                    data.guild.autoReactChannels = data.guild.autoReactChannels.filter((ch) => ch !== val);
                                    await data.guild.save();
                                }
                            }
                            let embed = new MessageEmbed()
                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                .setDescription(guild.translate("administration/autoreact:removed")
                                    .replace('{emotes.success}', this.client.emotes.success)
                                    .replace('{emote}', (emote.animated ? `<a:${emote.name}:${emote.id}>` : `<:${emote.name}:${emote.id}>`))
                                    .replace('{channel}', channel))
                                .setColor(this.client.embedColor)
                                .setFooter(data.guild.footer);
                            if (message) return reply.message(message, embed);
                            if (interaction) return reply.interaction(interaction, embed);
                        }else{
                            let embed = new MessageEmbed()
                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                .setDescription(guild.translate("administration/autoreact:notAdded")
                                    .replace('{emotes.error}', this.client.emotes.error)
                                    .replace('{emote}', (emote.animated ? `<a:${emote.name}:${emote.id}>` : `<:${emote.name}:${emote.id}>`))
                                    .replace('{channel}', channel))
                                .setColor(this.client.embedColor)
                                .setFooter(data.guild.footer);
                            if (message) return reply.message(message, embed);
                            if (interaction) return reply.interaction(interaction, embed);
                        }
                    }else{
                        let regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
                        if(regex.test(args[2])){
                            if(data.guild.autoReactChannels.includes(`${channel.id} | ${args[2]}`)){
                                for(let val of data.guild.autoReactChannels){
                                    if(val === `${channel.id} | ${args[2]}`) {
                                        data.guild.autoReactChannels = data.guild.autoReactChannels.filter((ch) => ch !== val);
                                        await data.guild.save();
                                    }
                                }
                                let embed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("administration/autoreact:removed")
                                        .replace('{emotes.success}', this.client.emotes.success)
                                        .replace('{emote}', args[2])
                                        .replace('{channel}', channel))
                                    .setColor(this.client.embedColor)
                                    .setFooter(data.guild.footer);
                                if (message) return reply.message(message, embed);
                                if (interaction) return reply.interaction(interaction, embed);
                            }else{
                                let embed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("administration/autoreact:notAdded")
                                        .replace('{emotes.error}', this.client.emotes.error)
                                        .replace('{emote}', args[2])
                                        .replace('{channel}', channel))
                                    .setColor(this.client.embedColor)
                                    .setFooter(data.guild.footer);
                                if (message) return reply.message(message, embed);
                                if (interaction) return reply.interaction(interaction, embed);
                            }

                        }else{
                            let embed = new MessageEmbed()
                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                .setDescription(guild.translate("administration/autoreact:usage")
                                        .replace('{prefix}', data.guild.prefix)
                                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                                    guild.translate("administration/autoreact:example")
                                        .replace('{prefix}', data.guild.prefix)
                                        .replace('{emotes.example}', this.client.emotes.example)
                                        .replace('{channel}', message?.channel?.name || interaction?.channel?.name))
                                .setColor(this.client.embedColor)
                                .setFooter(data.guild.footer);
                            if (message) return reply.message(message, embed);
                            if (interaction) return reply.interaction(interaction, embed);
                        }
                    }

                }
            }else{
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/autoreact:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/autoreact:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example)
                            .replace('{channel}', message?.channel?.name || interaction?.channel?.name))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return reply.message(message, embed);
                if (interaction) return reply.interaction(interaction, embed);
            }

        }
        if(args[0].toLowerCase() === 'list'){
            let autoreactChannels_ugly = [];
            for (let val of data.guild.autoReactChannels) {
                let channel = val.split(" | ")[0]
                if(val) {
                    if (val.startsWith(channel)) {
                        let id = val.split(" | ")[1]
                        let emote = await this.client.emojis.cache.find(emoji => emoji.id === id);
                        if(emote) {
                            autoreactChannels_ugly.push(`<#${channel}> | ` + `${emote.animated ? `<a:${emote.name}:${emote.id}>` : `<:${emote.name}:${emote.id}>`}`)
                        }else{
                            let emoji = val.split(' | ')[1]
                            autoreactChannels_ugly.push(`<#${channel}> | ` + `${emoji}`)
                        }

                    }
                }
            }
            let autoreactChannels = [];
            for(let item of autoreactChannels_ugly) {
                let channel = item.split(" | ")[0];
                let emote = item.split(" | ")[1];
                if(autoreactChannels[channel]) {
                    autoreactChannels[channel].push(emote);
                    continue;
                }
                autoreactChannels[channel] = [emote];
            }
            let formattedReactChannels = [];
            let i = 0;
            for(let val of Object.keys(autoreactChannels)) {
                formattedReactChannels.push(`${Object.keys(autoreactChannels)[i]} | ${autoreactChannels[Object.keys(autoreactChannels)[i]].join(", ")}`)
                i++
            }

            if(formattedReactChannels.length < 1) formattedReactChannels = [guild.translate("language:noEntries")];

            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/autoreact:list")
                    .replace('{emotes.success}', this.client.emotes.success)
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replace('{list}', formattedReactChannels.join(`\n${this.client.emotes.arrow} `)))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return reply.message(message, embed);
            if (interaction) return reply.interaction(interaction, embed);

        }
        if(args[0].toLowerCase() === 'reset'){
            if(!args[1]) {
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/autoreact:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/autoreact:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example)
                            .replace('{channel}', message?.channel?.name || interaction?.channel?.name))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return reply.message(message, embed);
                if (interaction) return reply.interaction(interaction, embed);
            }
            if(args[1].toLowerCase() === 'all'){
                data.guild.autoReactChannels = [];
                await data.guild.save();
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/autoreact:resetted")
                        .replace('{emotes.success}', this.client.emotes.success))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return reply.message(message, embed);
                if (interaction) return reply.interaction(interaction, embed);
            }

            let channel = guild.channels.cache.filter(ch => ch.type === 'GUILD_TEXT').get(args[1]);
            if (message) channel = message.mentions.channels.filter((ch) => ch.type === "GUILD_TEXT" || ch.type === "GUILD_NEWS" && ch.guild.id === message.guild.id).first();
            if(!channel){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/autoreact:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/autoreact:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example)
                            .replace('{channel}', message?.channel?.name || interaction?.channel?.name))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return reply.message(message, embed);
                if (interaction) return reply.interaction(interaction, embed);
            }else{
                let bool;
                for(let val of data.guild.autoReactChannels){
                    if(val.split(' | ')[0].toString() === channel.id.toString()){
                        data.guild.autoReactChannels = data.guild.autoReactChannels.filter((s) => s !== val);
                        bool = true;
                    }
                }
                if(bool){
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autoreact:resettedIn")
                            .replace('{emotes.success}', this.client.emotes.success)
                            .replace('{channel}', channel))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return reply.message(message, embed);
                    if (interaction) return reply.interaction(interaction, embed);
                }else{
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autoreact:noAutoreact")
                            .replace('{emotes.error}', this.client.emotes.error)
                            .replace('{channel}', channel))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return reply.message(message, embed);
                    if (interaction) return reply.interaction(interaction, embed);
                }
            }
        }
    }
}

module.exports = Autoreact;
