import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import {
    Argument,
    CommandOptions,
    InhibitorOptions,
    ListenerOptions,
} from 'discord-akairo';

export const Constants = {
    commands: {
        blacklistGet: {
            aliases: ['getblacklist'],
            description: {
                value: 'Gets the guild/global blacklist',
                usage: '',
            },
            category: 'settings',
        },

        blacklistAdd: {
            description: {
                value: 'Adds someone to the blacklist',
                usage: '<ID or mention>',
            },
            category: 'settings',
        },

        blacklist: {
            aliases: ['blacklist'],
            description: {
                value: stripIndents`
                    Methods:
                    • get
                    • add
                    • remove/rm
                `,
                usage: '<method> [...args]',
                examples: [
                    'get',
                    'add 586995575686168595',
                    "add @Apu's Analytics",
                    'rm 586995575686168595',
                    'remove 586995575686168595',
                ],
            },
            category: 'settings',
            channel: 'guild',
            clientPermissions: ['SEND_MESSAGES'],
            ratelimit: 2,
        },

        prefixGet: {
            aliases: ['getprefix'],
            description: {
                value: 'Gets the guild/global prefix',
                usage: '',
            },
            category: 'settings',
            ratelimit: 2,
        },

        prefixReset: {
            aliases: ['resetprefix'],
            description: {
                value: 'Resets the guild prefix',
                usage: '',
            },
            category: 'settings',
            ratelimit: 1,
            userPermissions: ['MANAGE_GUILD'],
        },

        prefixSet: {
            aliases: ['setprefix'],
            description: {
                value: 'Sets the guild prefix',
                usage: '<prefix>',
            },
            category: 'settings',
            channel: 'guild',
            ratelimit: 1,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    id: 'prefix',
                    default: process.env.prefix || 'apu',
                },
            ],
        },

        prefix: {
            aliases: ['prefix'],
            description: {
                value: stripIndents`
                    Methods:
                    • get
                    • set
                    • reset
                `,
                usage: '<method> [...args]',
                examples: ['get', 'set ?', 'set ::', 'reset'],
            },
            category: 'settings',
            clientPermissions: ['SEND_MESSAGES'],
            ratelimit: 2,
        },

        channel: {
            aliases: ['channel', 'channels'],
            description: {
                value: 'Provides statistics about a channel',
                usage: '<Channel or ID>',
                examples: ['#general', '697229938658377798'],
            },
            category: 'stats',
            channel: 'guild',
            ratelimit: 1,
            clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
            args: [
                {
                    id: 'channel',
                    type: 'channel',
                    default: (message: Message) => message.channel,
                },
            ],
        },

        messages: {
            aliases: ['message', 'messages'],
            description: {
                value: 'Provides statistics about messages',
                usage: '[User or ID] [Channel or ID] [content=...]',
                examples: [
                    '',
                    '@CHY4E',
                    'content=!help',
                    '@wrightq00 content="apu ping"',
                ],
            },
            category: 'stats',
            channel: 'guild',
            ratelimit: 1,
            clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
            args: [
                {
                    id: 'channel',
                    type: 'textChannel',
                    default: (message: Message) => message.channel,
                    unordered: true,
                },
                {
                    id: 'user',
                    type: 'user',
                    default: (message: Message) => message.author,
                    unordered: true,
                },
                {
                    id: 'content',
                    match: 'option',
                    flag: 'content=',
                },
            ],
        },

        presences: {
            aliases: ['presence', 'presences'],
            description: {
                value: 'Provides statistics about presences',
                usage: '[User or ID]',
                examples: ['', '@CHY4E', '196214245770133504'],
            },
            category: 'stats',
            channel: 'guild',
            ratelimit: 1,
            clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
            args: [
                {
                    id: 'user',
                    type: 'user',
                    default: (message: Message) => message.author,
                },
            ],
        },

        eval: {
            aliases: ['eval'],
            description: {
                value: 'Evaluates JavaScript',
                usage: '<code>',
                examples: [
                    'this.client.ws.ping',
                    'this.handler.prefix(message)',
                    'Date.now()',
                ],
            },
            category: 'util',
            clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
            ownerOnly: true,
            args: [
                {
                    id: 'awaitRes',
                    match: 'flag',
                    flag: 'await',
                },
                {
                    id: 'code',
                    match: 'rest',
                    type: Argument.compose((_, phrase: string) => {
                        while (phrase.charAt(0) === '`')
                            phrase = phrase.substring(1);
                        while (phrase.charAt(phrase.length - 1) === '`')
                            phrase = phrase.substring(0, phrase.length - 1);
                        if (phrase.startsWith('js'))
                            phrase = phrase.substring(2, phrase.length - 1);
                        return phrase;
                    }),
                    prompt: {
                        start: (message: Message) =>
                            `${message.author}, what would you like to evaulate?`,
                    },
                },
            ],
        },

        exec: {
            aliases: ['e', 'exec'],
            description: {
                value: 'Executes PowerShell commands',
                usage: '<code>',
                examples: ['pwd', 'cd D:\\', 'ping localhost'],
            },
            category: 'util',
            clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
            ownerOnly: true,
            args: [
                {
                    id: 'code',
                    match: 'rest',
                    prompt: {
                        start: (message: Message) =>
                            `${message.author}, what would you like to execute?`,
                    },
                },
            ],
        },

        help: {
            aliases: ['commands', 'help'],
            description: {
                value: 'Shows a list of commands or command info',
                usage: '[command]',
                examples: ['', 'ping', 'channel'],
            },
            category: 'util',
            clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
            args: [
                {
                    id: 'command',
                    type: 'command',
                },
            ],
        },

        ping: {
            aliases: ['pong', 'ping'],
            description: {
                value: 'Gets the latency to Discord API',
            },
            category: 'util',
            clientPermissions: ['SEND_MESSAGES'],
            ratelimit: 2,
        },

        reload: {
            aliases: ['reload'],
            description: {
                value: 'Reloads commands, inhibitors, and listeners',
                usage: '[command]',
                examples: ['', 'reload', 'ping'],
            },
            clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
            ownerOnly: true,
            args: [
                {
                    id: 'module',
                },
            ],
        },

        restart: {
            aliases: ['shutdown', 'restart'],
            description: {
                value: 'Restarts all shards',
            },
            category: 'util',
            ownerOnly: true,
            args: [
                {
                    id: 'force',
                    match: 'flag',
                    flag: ['-y', '--yes', '-f', '--force'],
                },
            ],
        },

        stats: {
            aliases: ['about', 'info', 'stats'],
            description: {
                value: 'Gets stats for this bot',
            },
            category: 'util',
            ratelimit: 1,
        },

        time: {
            aliases: ['time'],
            description: {
                value: 'Times command execution (content processed as message)',
                usage: '<content>',
                examples: ['apu ping', 'apu time apu stats', 'apu help'],
            },
            category: 'util',
            ownerOnly: true,
            args: [
                {
                    id: 'rest',
                    match: 'restContent',
                },
            ],
        },
    } as C<CommandOptions>,

    inhibitors: {
        blacklist: {
            reason: 'blacklist',
            type: 'post',
            priority: 5,
        },

        channel: {
            reason: 'channel type',
            type: 'pre',
            priority: 2,
        },

        userPermissions: {
            reason: 'user permissions',
            type: 'pre',
            priority: 3,
        },
    } as C<InhibitorOptions>,

    listeners: {
        guildCreate: {
            event: 'guildCreate',
            emitter: 'client',
            category: 'client',
        },

        messageReactionAdd: {
            event: 'messageReactionAdd',
            emitter: 'client',
            category: 'client',
        },

        ready: {
            event: 'ready',
            emitter: 'client',
            category: 'client',
        },

        commandFinished: {
            event: 'commandFinished',
            emitter: 'commandHandler',
            category: 'client',
        },
    } as C<ListenerOptions>,
};

type C<T> = { [id: string]: T };
