import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';
import { Constants } from '../../structures/util/Constants';

export default class PrefixCommand extends Command {
    public constructor() {
        super('prefix', Constants.commands.prefix);
    }

    public *args() {
        const method = yield {
            type: [
                ['prefix-get', 'get'],
                ['prefix-set', 'set'],
                ['prefix-reset', 'reset'],
            ],
            otherwise: async (message: Message) => {
                const prefix = await (this.handler.prefix as PrefixSupplier)(
                    message
                );
                message.util!.send(
                    `\`${
                        message.guild?.name ?? this.client.user!.username
                    }\`'s prefix is \`${prefix}\``
                );
            },
        };

        return Flag.continue(method);
    }
}
