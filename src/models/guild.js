const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const toml = require('toml');
const fs = require('fs');
const config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));
const languages = require('../../languages/language-meta.json');

module.exports = mongoose.model("Guild", new Schema({

    id: {
        type: String
    },

    membersData: {
        type: Object,
        default: {}
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: "Member"
    }],

    language: {
        type: String,
        default: languages.find((l) => l.default)
            .name
    },

    blocked: {
        type: Boolean,
        default: false
    },
    premium: {
        type: Boolean,
        default: false
    },
    prefix: {
        type: String,
        default: config.general.default_prefix
    },
    plugins: {
        type: Object,
        default: {
            levelsystem: {
                enabled: false,
                channel: null,
                message: 'GG %%user, du bist jetzt Level %%level!',
                levelroles: [],
                doubleXpRoles: []
            },
            joinToCreate: {
                enabled: false,
                voice: null,
                userLimit: null,
                bitrate: null,
                tempChannels: []
            },
            blacklist: {
                list: []
            },
            autoroles: {
                list: []
            },
            welcome: {
                enabled: false,
                message: null,
                channel: null,
            },
            goodbye: {
                enabled: false,
                message: null,
                channel: null,
            },
            autoSanctions: {
                kick: false,
                ban: false
            },
            autoDeleteChannels: [],
            reactionRoles: [],

        }
    },
    commands: {
        type: Array,
        default: []
    },
    footer: {
        type: String,
        default: config.embeds.footer
    }

}));
