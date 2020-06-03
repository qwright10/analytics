import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import { Constants } from '../../structures/util/Constants';

export default class MessageListener extends Listener {
    public constructor() {
        super('commandFinished', Constants.listeners.commandFinished);
    }

    public async exec(message: Message, _: any, __: any, returnValue: any): Promise<any> {
        if (!(returnValue instanceof Message) || returnValue.embeds.length < 1) return;
        
        this.client.embeds.set(message.author.id, returnValue.id);
        const reaction = await returnValue.react('🗑️');
        setTimeout(() => {
            if (reaction.message.deleted) {
                this.client.embeds.delete(reaction.message.id);
                return;
            }

            reaction.users.remove(this.client.user!);
        }, 10000);
    }
}