import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Constants } from '../../structures/util/Constants';

export default class PrefixResetCommand extends Command {
    public constructor() {
        super('prefix-reset', Constants.commands.prefixReset);
    }

    public async exec(message: Message): Promise<Message | Message[]> {
        const prefix = await this.client.settings.get<string>(message.guild!, 'prefix');

        if (prefix === this.client.settings.defaults.prefix) {
            const msg = `\`${message.guild!.name}\`'s prefix is already the default prefix.`;
            return message.util!.send(msg);
        }

        const settings = await this.client.settings.reset(message.guild!, 'prefix');
        const msg = `\`${message.guild!.name}\`'s prefix was reset to \`${settings.prefix}\``;
        return message.util!.send(msg);
    }
}