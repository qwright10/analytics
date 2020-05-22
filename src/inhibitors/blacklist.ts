import { Inhibitor } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';

export default class BlacklistInhibtor extends Inhibitor {
    public constructor() {
        super('blacklist', {
            reason: 'blacklist',
            type: 'pre',
            priority: 5
        });
    }

    public async exec(message: Message): Promise<boolean> {
        const blacklist = await this.client.settings.get(message.guild ?? '0', 'blacklist', []);
        if (blacklist.includes(message.author.id)) {
            const embed = new MessageEmbed().setTitle('You are on the blacklist.');
            message.util!.send(embed);
            return true;
        }

        return false;
    }
}