import { AkairoClient } from 'discord-akairo';
import { Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import fetch from 'node-fetch';

export class AnalyticsUtils {
    public constructor(public readonly client: AkairoClient) {}

    public async fetchAndReduce(toFetch: string): Promise<any> {
        const result = await this.client.shard!.fetchClientValues(toFetch);
        if (!result[0]) throw new Error('Nothing was returned');

        if (typeof result[0] === 'number')
            return result.reduce((a, b) => a + b, 0);
        if (result[0] instanceof Array) return result.flat(Infinity);
    }

    public async paginate<T = { [key: string]: any }>(
        message: Message,
        data: T[],
        fn: (item: T, index: number) => MessageEmbed
    ): Promise<void> {
        if (!data.length) return Promise.reject();
        let index = 0,
            max = data.length - 1;
        const embed = fn(data[index], index);
        if (!(embed instanceof MessageEmbed)) return Promise.reject();
        const m = await message.util!.sendNew(embed);
        const filter = (_: any, u: User) => message.author.id === u.id;
        await m.react('⬅');
        await m.react('➡');
        const collector = m.createReactionCollector(filter, {
            max: 10,
            time: 30e3,
        });
        const update = (r: MessageReaction): any => {
            if (r.emoji.name === '⬅') {
                index === 0 ? (index = max) : index--;
                const embed = fn(data[index], index);
                return m.edit('', embed);
            }
            if (r.emoji.name === '➡') {
                index === max ? (index = 0) : index++;
                const embed = fn(data[index], index);
                return m.edit('', embed);
            }
        };
        collector.on('collect', (r) => update(r));
        collector.on('remove', (r) => update(r));
    }

    public pgify(date: Date | number = new Date()): string {
        if (typeof date === 'number') date = new Date(date);
        return date.toISOString().replace('T', ' ').replace('Z', '');
    }

    public async prompt(
        prompt: string,
        message: Message,
        filter?: (message: Message) => boolean
    ): Promise<boolean | null> {
        const m = await message.channel.send(prompt);
        const res = await m.channel.awaitMessages(
            filter ?? ((msg: Message) => msg.author.id === message.author.id),
            { time: 30000, max: 1 }
        );

        if (!res.size) return false;
        const first = res.first()!;

        if (/(y|yes)/i.test(first.content)) return true;
        if (/(n|no)/i.test(first.content)) return false;
        return null;
    }

    public async upload(text: string): Promise<string> {
        return await fetch('https://hasteb.in/documents', {
            method: 'POST',
            body: text,
        })
            .then((r) => r.json())
            .then((r) => {
                if (!r) return Promise.reject('Invalid hastebin response');
                if (!r.key) return Promise.reject('Document key not found');
                return `https://hasteb.in/${r.key}`;
            });
    }
}
