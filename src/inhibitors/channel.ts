import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';
import { Constants } from '../structures/util/Constants';

export default class ChannelInhibitor extends Inhibitor {
    public constructor() {
        super('channel', Constants.inhibitors.channel);
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