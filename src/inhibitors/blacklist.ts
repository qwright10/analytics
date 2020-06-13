import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';
import { Constants } from '../structures/util/Constants';

export default class BlacklistInhibtor extends Inhibitor {
    public constructor() {
        super('blacklist', Constants.inhibitors.blacklist);
    }

    public async exec(message: Message): Promise<boolean> {
        const blacklist = await this.client.settings.get<string[]>(
            message.guild ?? '0',
            'blacklist',
            []
        );
        return blacklist.includes(message.author.id);
    }
}
