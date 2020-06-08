import { Listener } from 'discord-akairo';
import { Guild } from 'discord.js';
import { Constants } from '../../structures/util/Constants';
import { stripIndents } from 'common-tags';

export default class GuildCreateListener extends Listener {
    public constructor() {
        super('guildCreate', Constants.listeners.guildCreate);
    }

    public async exec(guild: Guild): Promise<void> {
        if (!this.client.settings.cache.has(guild.id)) this.client.settings.create(guild);
        this.client.logger.info(`Joined guild: ${guild.name}`);

        const guildOwner = await this.client.users.fetch(guild.ownerID);
        const botOwner = await this.client.users.fetch(this.client.ownerID as string);
        const msg = stripIndents`
            This bot collected **a lot** of data, including:
            messages, member/user objects, presence updates,
            emojis, channels, and any updates to these objects. 
            If you are **not** okay with this, remove me from your
            guild and DM ${botOwner.tag} to request deletion.
        `;
        guildOwner.send(msg);
    }
}