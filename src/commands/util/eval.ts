import { Command, Argument } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import util from 'util';

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
                    id: 'awaitRes',
                    match: 'flag',
                    flag: 'await'
                },
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

    public async exec(message: Message, { awaitRes, code }: { awaitRes: boolean; code: string }): Promise<Message | Message[]> {
        let hrDiff, result;
        try {
            this.hrStart = process.hrtime();
            result = eval(code);
            if (result instanceof Promise && awaitRes) result = await result;
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
            return this.client.utils.upload(inspected)
                .then(url =>
                    new MessageEmbed()
                        .setURL(url)
                        .setDescription(url)
                )
                .catch(reason => 
                    new MessageEmbed().setDescription(reason)
                );
        }

        return new MessageEmbed()
            .setTitle(`Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.`)
            .addField('Input', `\`\`\`js\n${code}\`\`\``)
            .addField('Result', `\`\`\`js\n${inspected}\`\`\``)
            .setTimestamp();
    }
}