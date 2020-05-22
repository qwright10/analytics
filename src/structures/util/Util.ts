import { AnalyticsClient } from '../../client/AnalyticsClient';
import { Message, MessageEmbed, MessageReaction, User } from 'discord.js';

export class DynamoUtils {
    public constructor(public readonly client: AnalyticsClient) {}
    
    public async paginate<T = { [key: string]: any }>(message: Message, data: T[], fn: (item: T) => MessageEmbed): Promise<void> {
        if (!data.length) return Promise.reject();
        let index = 0, max = data.length - 1;
        const embed = fn(data[index]);
        if (!(embed instanceof MessageEmbed)) return Promise.reject();
        const m = await message.util!.sendNew(embed);
        const filter = (_: any, u: User) => message.author.id === u.id;
        await m.react('⬅');
        await m.react('➡');
        const collector = m.createReactionCollector(filter, { max: 10, time: 30e3 });
        const update = (r: MessageReaction): any => {
            console.log(r.emoji.name);
            if (r.emoji.name === '⬅') {
                index === 0 ? index = max : index--;
                const embed = fn(data[index]);
                return m.edit('', embed);
            }
            if (r.emoji.name === '➡') {
                index === max ? index = 0 : index++;
                const embed = fn(data[index]);
                return m.edit('', embed);
            }
        };
        collector.on('collect', (r) => update(r));
        collector.on('remove', (r) => update(r));
    }

    public async prompt(prompt: string, message: Message, filter?: (message: Message) => boolean): Promise<boolean | null> {
        const m = await message.channel.send(prompt);
        const res = await m.channel.awaitMessages(filter ?? ((msg: Message) => msg.author.id === message.author.id), { time: 30000, max: 1 });
        
        if (!res.size) return false;
        const first = res.first()!;

        if (/(y|yes)/i.test(first.content)) return true;
        if (/(n|no)/i.test(first.content)) return false;
        return null;
    }
}