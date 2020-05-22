import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { Message, Intents } from 'discord.js';

import { createConnection } from 'typeorm';
import Entities from '../structures/db';
import { SettingsProvider } from '../structures/db/SettingsProvider';
import { MessageHandler } from './MessageHandler';

import path from 'path';
import { Logger } from '../structures/util/Logger';
import { DynamoUtils } from '../structures/util/Util';

declare module 'discord-akairo' {
    interface AkairoClient {
        readonly commandHandler: CommandHandler;
        readonly config: AnalyticsConfig;
        readonly embeds: Map<string, string>;
        readonly events: MessageHandler;
        readonly inhibitorHandler: InhibitorHandler;
        readonly listenerHandler: ListenerHandler;
        readonly logger: typeof Logger;
        readonly settings: SettingsProvider;
        utils: DynamoUtils;
    }
}

interface AnalyticsConfig {
    owner?: string;
    token?: string;
}

export class AnalyticsClient extends AkairoClient {
    public readonly commandHandler: CommandHandler = new CommandHandler(this, {
        directory: path.join(__dirname, '..', 'commands'),
        prefix: async (message: Message): Promise<string> => await this.settings.get(message.guild ?? '0', 'prefix', process.env.prefix),
        allowMention: true,
        handleEdits: true,
        commandUtil: true,
        commandUtilLifetime: 3e5,
        defaultCooldown: 3e3,
        argumentDefaults: {
            prompt: {
                modifyStart: (_:any, phrase: string): string => `${phrase}\nType \`cancel\` to cancel the command.`,
                modifyRetry: (_:any, phrase: string): string => `${phrase}\nType \`cancel\` to cancel the command.`,
                timeout: 'Command timed out, canceling.',
                ended: 'Too many attempts, canceling.',
                cancel: 'Command canceled',
                retries: 3,
                time: 3e4
            }
        }
    });

    public readonly inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, { directory: path.join(__dirname, '..', 'inhibitors') });
    public readonly listenerHandler: ListenerHandler = new ListenerHandler(this, { directory: path.join(__dirname, '..', 'listeners') });

    public readonly embeds = new Map<string, string>();
    public readonly events = new MessageHandler(this);
    public readonly logger = Logger;
    public readonly settings = new SettingsProvider(this);
    public utils = new DynamoUtils(this);

    public constructor(public readonly config: AnalyticsConfig) {
        super({ ownerID: config.owner }, {
            messageCacheMaxSize: Infinity,
            messageCacheLifetime: Infinity,
            shardCount: 1,
            partials: ['CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION', 'USER'],
            fetchAllMembers: true,
            ws: {
                intents: new Intents(['GUILD_PRESENCES', 'GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS'])
            }
        });
    }

    public async start(): Promise<string> {
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            inhibitorHandler: this.inhibitorHandler,
            listenerHandler: this.listenerHandler
        });

        this.commandHandler.loadAll();
        this.logger.log(`Commands loaded: ${this.commandHandler.modules.size} modules`);
        this.inhibitorHandler.loadAll();
        this.logger.log(`Inhibitors loaded: ${this.inhibitorHandler.modules.size} modules`);
        this.listenerHandler.loadAll();
        this.logger.log(`Listeners loaded: ${this.listenerHandler.modules.size} modules`);

        this.on('shardReady', (id: number) => this.logger.info(`Shard ${id} ready`));
        this.on('shardDisconnect', (_event:any, id: number) => this.logger.error(`Shard ${id} disconnected`));
        this.on('shardError', (error: Error, id: number) => this.logger.error(`Shard ${id} error: ${error}`));
        this.setMaxListeners(20);

        await createConnection({
            name: 'default',
            url: process.env.pg,
            type: 'postgres',
            entities: Entities,
            synchronize: true,
            logging: false,
            cache: {
                type: 'redis',
                options: {
                    host: 'localhost',
                    port: 6379
                }
            }
        }).catch((e): any => {
            this.logger.error(`Failed to connect to postgres db:\n${e}`);
            return process.exit(1);
        });

        await this.settings.init();
        this.logger.log(`Settings provider initialized: ${this.settings.cache.size}`);

        this.events.registerAll();
        this.logger.log('Message Handler initialized');

        this.logger.log('Logging in...');
        return this.login(this.config.token);
    }
}