import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Constants } from '../../structures/util/Constants';
import { stripIndents } from 'common-tags';

export default class PrefixGetCommand extends Command {
    public constructor() {
        super('blacklist-get', Constants.commands.blacklistGet);
    }

    public async exec(message: Message): Promise<Message | Message[]> {
        const guildBlacklist = await this.client.settings.get<string[]>(
            message.guild,
            'blacklist'
        );
        const globalBlacklist = await this.client.settings.get<string[]>(
            '0',
            'blacklist'
        );

        if (message.guild) {
            if (guildBlacklist === undefined)
                return message.util!.send(
                    'Something went wrong while fetching the blacklist.'
                );
            if (!guildBlacklist.length)
                return message.util!.send('Nobody is blacklisted');
            const msg = stripIndents`
                The guild blacklist is:
                ${guildBlacklist
                    .map((id) => `\`${id}\``)
                    .join(' ')
                    .slice(0, 1000)}`;
            return message.util!.send(msg);
        } else {
            if (globalBlacklist === undefined)
                return message.util!.send(
                    'Something went wrong while fetching the blacklist.'
                );
            if (!globalBlacklist.length)
                return message.util!.send('Nobody is blacklisted');

            const msg = stripIndents`
                The global blacklist is:
                ${globalBlacklist
                    .map((id) => `\`${id}\``)
                    .join(' ')
                    .slice(0, 1000)}`;
            return message.util!.send(msg);
        }
    }
}
