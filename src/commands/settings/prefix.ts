import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PrefixCommand extends Command {
    public constructor() {
        super('prefix', {
            aliases: ['prefix'],
            description: 'Gets, sets, or resets the prefix',
            category: 'settings',
            channel: 'guild',
            clientPermissions: ['SEND_MESSAGES'],
            ratelimit: 2
        });
    }

    public *args() {
        const method = yield {
            type: [
                ['prefix-get', 'get'],
                ['prefix-set', 'set'],
                ['prefix-reset', 'reset']
            ],
            otherwise: async (message: Message) => {
                const prefix = await (this.handler.prefix as PrefixSupplier)(message);
                message.util!.send(`\`${message.guild!.name}\`'s prefix is \`${prefix}\``);
            }
        };

        return Flag.continue(method);
    }
}