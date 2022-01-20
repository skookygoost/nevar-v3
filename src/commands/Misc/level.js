const Command = require('../../core/command');
const Levels = require('discord-xp');
const Canvas = require('canvas');
const Discord = require('discord.js');
const { CanvasRenderingContext2D } = require('canvas');
const {SlashCommandBuilder} = require("@discordjs/builders");

Canvas.registerFont('./storage/fonts/KeepCalm-Medium.ttf', { family: 'KeepCalm' });



// Function to create rounded rectangles
CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
}

function roundedImage(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

class Level extends Command {
    constructor(client) {
        super(client, {
            name: "level",
            description: "misc/lvl:general:description",
            dirname: __dirname,
            aliases: ["rank"],
            cooldown: 3000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addUserOption(option =>
                        option.setName('misc/lvl:slash:1:name')
                            .setDescription('misc/lvl:slash:1:description')
                            .setRequired(false))
            }
        });
    }
    async run(interaction, message, args, data){
        const channel = interaction?.channel || message?.channel;
        const guild = interaction?.guild || message?.guild;
        let member = interaction?.member || message?.member;
        if(interaction) await interaction.deferReply();
        if(args[0]) member = await this.client.resolveMember(args[0], guild);
        const dbUser = await this.client.findOrCreateUser({id:member.user.id});

        console.log(dbUser)
        await Levels.createUser(member.user.id, guild.id, true);

        const user = {
            db: dbUser,
            discord: member,
            level: await Levels.fetch(member.user.id, guild.id, true)
        };

        //Create image
        const canvas = Canvas.createCanvas(1000, 300);
        const ctx = canvas.getContext('2d');

        // set gray background
        ctx.fillStyle = "#23272a";
        ctx.roundRect(0, 0, canvas.width, canvas.height, 8).fill();

        if(user.db.levelBackground === 0){
            ctx.fillStyle = "#090a0b";
            ctx.roundRect(25, 25, 950, 250, 15).fill();
        }else{
            const background = await Canvas.loadImage("./storage/levelcards/" + user.db.levelBackground + ".png");
            ctx.save();
            roundedImage(ctx, 25, 25, 950, 250, 10);
            ctx.stroke()
            ctx.clip();
            ctx.drawImage(background, 25, 25, 950, 250);
            ctx.restore();
        }

        // write username
        ctx.fillStyle = "#ffffff"; // white text
        let text = user.discord.user.username; // text to draw
        if(text.length > 15) text = text.substring(0, 15); // cut text if too long
        ctx.font = "60px Calibri" // font size and type
        ctx.fillText(text, 290, 170) // draw text

        // write level and rank
        ctx.fillStyle = "#ffffff";
        text = user.level.position;
        ctx.font = "61px Calibri"
        if(text.toString().length === 1) {
            ctx.fillText("#" + text, 605, 95)
            let rankText = guild.translate("misc/lvl:level:rank");
            ctx.font = "36px Calibri";
            ctx.fillText(rankText, 520, 95)

            ctx.fillStyle = "#"+user.db.levelColor;
            let levelText = guild.translate("misc/lvl:level:level");
            ctx.font = "36px Calibri"
            ctx.fillText(levelText, 730, 95)
            ctx.fillStyle = "#"+user.db.levelColor;
            let levelIntText = user.level.level;
            ctx.font = "61px Calibri"
            ctx.fillText(levelIntText, 815, 95)
        }
        if(text.toString().length === 2) {
            ctx.fillText("#" + text, 590, 95)
            ctx.fillStyle = "#ffffff";
            let rankText = guild.translate("misc/lvl:level:rank");
            ctx.font = "36px Calibri";
            ctx.fillText(rankText, 505, 95)

            ctx.fillStyle = "#"+user.db.levelColor;
            let levelText = message.translate("misc/lvl:level:level");
            ctx.font = "36px Calibri"
            ctx.fillText(levelText, 745, 95)
            ctx.fillStyle = "#"+user.db.levelColor;
            let levelIntText = user.level.level;
            ctx.font = "61px Calibri"
            ctx.fillText(levelIntText, 830, 95)
        }
        if(text.toString().length === 3) {
            ctx.fillText("#" + text, 575, 95)
            ctx.fillStyle = "#ffffff";
            let rankText = guild.translate("misc/lvl:level:rank");
            ctx.font = "36px Calibri";
            ctx.fillText(rankText, 490, 95)

            ctx.fillStyle = "#"+user.db.levelColor;
            let levelText = guild.translate("misc/lvl:level:level");
            ctx.font = "36px Calibri"
            ctx.fillText(levelText, 745, 95)
            ctx.fillStyle = "#"+user.db.levelColor;
            let levelIntText = user.level.level;
            ctx.font = "61px Calibri"
            ctx.fillText(levelIntText, 830, 95)
        }
        if(text.toString().length === 4) {
            ctx.fillText("#" + text, 545, 95)
            ctx.fillStyle = "#ffffff";
            let rankText = guild.translate("misc/lvl:level:rank");
            ctx.font = "36px Calibri";
            ctx.fillText(rankText, 460, 95)

            ctx.fillStyle = "#"+user.db.levelColor;
            let levelText = guild.translate("misc/lvl:level:level");
            ctx.font = "36px Calibri"
            ctx.fillText(levelText, 745, 95)
            ctx.fillStyle = "#"+user.db.levelColor;
            let levelIntText = user.level.level;
            ctx.font = "61px Calibri"
            ctx.fillText(levelIntText, 830, 95)
        }

        // write current xp / needed xp
        function kFormatter(int){
            return Math.abs(int) > 999 ? Math.sign(int)*((Math.abs(int)/1000).toFixed(1)) + 'K' : Math.sign(int)*Math.abs(int);
        }

        ctx.fillStyle = '#ffffff';
        text = kFormatter(user.level.xp) + ' / ' + kFormatter(Levels.xpFor(user.level.level + 1)) + ' XP';
        ctx.font = "29px Calibri";

        // draw text
        if(text.length === 10) ctx.fillText(text, 740, 170);
        if(text.length > 10 && text.length <= 13) ctx.fillText(text, 710, 170);
        if(text.length > 13 && text.length < 15) ctx.fillText(text, 695, 170);
        if(text.length > 15 && text.length < 17) ctx.fillText(text, 675, 170);
        if(text.length > 17 && text.length < 21) ctx.fillText(text, 660, 170);
        if(text.length > 21 && text.length < 25) ctx.fillText(text, 615, 170);
        if(text.length > 25 && text.length < 29) ctx.fillText(text, 590, 170);

        // draw progress bar
        ctx.roundRect(290, 185, 600, 40, 10).fill();

        // draw progress bar fill
        const xpPercent = (user.level.xp * 100) / Levels.xpFor(user.level.level + 1);
        const percentWidth = (xpPercent * 600) / 100;
        ctx.fillStyle = '#'+user.db.levelColor;
        ctx.roundRect(290, 185, percentWidth, 40, 10).fill();


        // draw circle
        ctx.beginPath();
        ctx.arc(170, 150, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await Canvas.loadImage(user.discord.user.displayAvatarURL({ format: 'png'}));
        ctx.drawImage(avatar, 70, 50, 200, 200);

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'level-' + user.discord.user.id + '.png');
        if(interaction) interaction.editReply({files: [attachment] });
        if(message) message.reply({ files: [attachment] });




    }
}

module.exports = Level;
