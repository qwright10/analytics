import { Listener } from 'discord-akairo';
import { Guild } from 'discord.js';

export default class GuildCreateListener extends Listener {
    public constructor() {
        super('guildCreate', {
            event: 'guildCreate',
            emitter: 'client',
            category: 'client'
        });
    }

    public async exec(guild: Guild): Promise<void> {
        if (!this.client.settings.cache.has(guild.id)) this.client.settings.create(guild);
        this.client.logger.info(`Joined guild: ${guild.name}`);
    }
}