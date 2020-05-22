import { Command, Argument } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import util from 'util';
import fetch from 'node-fetch';
// @ts-ignore
import { getConnection } from 'typeorm';
getConnection;

export default class EvalCommand extends Command {
    public hrStart?: [number, number];
    
    public constructor() {
        super('eval', {
            aliases: ['eval'],
            description: 'Evaluates JavaScript',
            category: 'util',
            clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
            ownerOnly: true,
            args: [
                {
                    id: 'code',
                    match: 'rest',
                    type: Argument.compose((_, phrase: string) => {
                        while (phrase.charAt(0) === '`') phrase = phrase.substring(1);
                        while (phrase.charAt(phrase.length - 1) === '`') phrase = phrase.substring(0, phrase.length - 1);
                        if (phrase.startsWith('js')) phrase = phrase.substring(2, phrase.length - 1);
                        return phrase;
                    }),
                    prompt: {
                        start: (message: Message): string => `${message.author}, what would you like the evaluate?`
                    }
                }
            ]
        });
    }

    public async exec(message: Message, { code }: { code: string }): Promise<Message | Message[]> {
        let hrDiff, result;
        try {
            this.hrStart = process.hrtime();
            result = eval(code);
            if (result instanceof Promise) result = await result;
            hrDiff = process.hrtime(this.hrStart);
        } catch (error) {
            return message.util!.send(`Error while evaluating: \`${error}\``);
        }

        const res = await this._process(result, hrDiff, code);
        return message.util!.send(res);
    }

    private async _process(result: any, hrDiff: [number, number], code: string): Promise<MessageEmbed> {
        const inspected = util.inspect(result, { depth: 1 });
        if (inspected.length > 1000) {
            const res = await fetch('https://hastebin.com/documents', {
                method: 'POST',
                body: inspected
            }).then(r => r.json()).catch(this.client.logger.error);
            if (!res) return new MessageEmbed().setDescription('Something went wrong.');
            if (!res.key) return new MessageEmbed().setDescription('Hastebin.com returned an invalid response');
            return new MessageEmbed()
                .setURL(`https://hastebin.com/${res.key}.js`)
                .setDescription(`https://hastebin.com/${res.key}.js`);
        }

        return new MessageEmbed()
            .setTitle(`Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.`)
            .addField('Input', `\`\`\`js\n${code}\`\`\``)
            .addField('Result', `\`\`\`js\n${inspected}\`\`\``)
            .setTimestamp();
    }
}