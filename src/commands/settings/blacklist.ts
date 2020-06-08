import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';
import { Constants } from '../../structures/util/Constants';

export default class BlacklistCommand extends Command {
    public constructor() {
        super('blacklist', Constants.commands.blacklist);
    }

    public *args() {
        const method = yield {
            type: [
                ['blacklist-get', 'get'],
                ['blacklist-add', 'add'],
                ['blacklist-remove', ['remove', 'rm']]
            ],
            otherwise: async (message: Message) => {
                const prefix = await (this.handler.prefix as PrefixSupplier)(message);
                return message.util!.send(`Did you mean \`${prefix}blacklist get\`?`);
            }
        };

        return Flag.continue(method);
    }
}