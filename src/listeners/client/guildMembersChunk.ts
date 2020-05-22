import { Listener } from 'discord-akairo';
import { Collection, Guild, GuildMember, Snowflake } from 'discord.js';

export default class GuildMembersChunkListener extends Listener {
    public constructor() {
        super('guildMembersChunk', {
            event: 'guildMembersChunk',
            emitter: 'client',
            category: 'client'
        });
    }

    public async exec(members: Collection<Snowflake, GuildMember>, guild: Guild): Promise<void> {
        this.client.logger.log(`${members.size} members loaded for ${guild.name}`);
    }
}