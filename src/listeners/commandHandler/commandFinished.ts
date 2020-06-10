import { Listener, Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Constants } from '../../structures/util/Constants';
import { getRepository } from 'typeorm';
import { Stats } from '../../structures/db';

export default class MessageListener extends Listener {
    public constructor() {
        super('commandFinished', Constants.listeners.commandFinished);
    }

    public async exec(message: Message, command: Command, __: any, returnValue: any): Promise<any> {
        getRepository(Stats).insert({
            timestamp: this.client.utils.pgify(),
            shard: this.client.shard!.ids[0],
            type: 'command',
            data: {
                id: command.id,
                by: message.author.id
            }
        } as any);
        
        if (!(returnValue instanceof Message) || returnValue.embeds.length < 1) return;
        
        this.client.embeds.set(message.author.id, returnValue.id);
        const reaction = await returnValue.react('🗑️');
        setTimeout(() => {
            if (reaction.message.deleted) return this.client.embeds.delete(reaction.message.id);
            return reaction.users.remove(this.client.user!);
        }, 10000);
    }
}