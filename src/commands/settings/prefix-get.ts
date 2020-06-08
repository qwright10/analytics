import { Command, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';
import { Constants } from '../../structures/util/Constants';

export default class PrefixResetCommand extends Command {
    public constructor() {
        super('prefix-get', Constants.commands.prefixGet);
    }

    public async exec(message: Message): Promise<Message | Message[]> {
        const prefix = await (this.handler.prefix as PrefixSupplier)(message);
        return message.util!.send(`\`${message.guild?.name ?? this.client.user!.username}\`'s prefix is \`${prefix}\``);
    }
}