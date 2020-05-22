import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ChannelTypeInhibitor extends Inhibitor {
    public constructor() {
        super('channel-type', {
            reason: 'channel type',
            type: 'pre',
            priority: 2
        });
    }

    public async exec(message: Message): Promise<boolean> {
        const { alias, command } = await this.client.commandHandler.parseCommand(message);
        if (!command) return false;

        if (!command.channel || command.channel === 'any') return false;
        if (command.channel === 'guild' && !message.guild) {
            message.channel.send(`\`${alias}\` can only be used in guild channels.`);
            return true;
        } else if (command.channel === 'dm' && message.guild) {
            message.channel.send(`\`${alias}\` can only be used in DM channels.`);
            return true;
        }

        return false;
    }
}