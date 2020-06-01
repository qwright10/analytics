import { Command, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PrefixResetCommand extends Command {
    public constructor() {
        super('prefix-get', {
            aliases: ['getprefix'],
            description: 'Resets the guild prefix.',
            category: 'settings',
            channel: 'guild',
            ratelimit: 2,
            clientPermissions: ['SEND_MESSAGES']
        });
    }

    public async exec(message: Message): Promise<Message | Message[]> {
        const prefix = await (this.handler.prefix as PrefixSupplier)(message);
        return message.util!.send(`\`${message.guild!.name}\`'s prefix is \`${prefix}\``);
    }
}