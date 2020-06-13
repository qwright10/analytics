import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Constants } from '../../structures/util/Constants';

const prefixRegex = /^[?!@#$%^&*()_+-=[\]{}|;':",.<>/`~\w\d\s\u200D\u200B]{1,12}$/i;

export default class PrefixSetCommand extends Command {
    public constructor() {
        super('prefix-set', Constants.commands.prefixSet);
    }

    public async exec(
        message: Message,
        { prefix }: { prefix: string }
    ): Promise<Message | Message[]> {
        if (!prefixRegex.test(prefix)) {
            const msg = 'Prefixes can only be 1 to 12 characters.';
            return message.util!.send(msg);
        }

        this.client.settings.set(message.guild!, 'prefix', prefix);
        const msg = `\`${message.guild!}\`'s prefix is now \`${prefix}\``;
        return message.util!.send(msg);
    }
}
