import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class MessageListener extends Listener {
    public constructor() {
        super('commandFinished', {
            event: 'commandFinished',
            emitter: 'commandHandler',
            category: 'client'
        });
    }

    public async exec(message: Message, _: any, __: any, returnValue: any): Promise<any> {
        if (!(returnValue instanceof Message) || returnValue.embeds.length < 1) return;
        
        this.client.embeds.set(message.author.id, returnValue.id);
        const reaction = await returnValue.react('🗑️');
        setTimeout(() => {
            this.client.embeds.delete(message.author.id);
            reaction.users.remove(this.client.user!);
        }, 10000);
    }
}