import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { ChildProcess, exec } from 'child_process';

export default class ExecCommand extends Command {
    public constructor() {
        super('exec', {
            aliases: ['e', 'exec'],
            description: 'Executes commands in cmd.exe.',
            category: 'util',
            clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
            ownerOnly: true,
            args: [
                {
                    id: 'code',
                    match: 'rest',
                    prompt: {
                        start: (message: Message): string => `${message.author}, what would you like to execute?`
                    }
                }
            ]
        });
    }

    public async exec(message: Message, { code }: { code: string }): Promise<ChildProcess> {
        let hrTime: [number, number] = process.hrtime();
        return exec(code, { windowsHide: true }, async (err, stdout): Promise<Message | Message[]> => {
            hrTime = process.hrtime(hrTime);
            let result = (err ?? stdout) as string;
            if (result.length > 1950) {
                const key = await fetch('https://hastebin.com/documents', {
                    method: 'POST',
                    body: result
                }).then(async r =>console.log(await r.text())); //.then(r => r.json().then(j => j.key)).catch(this.client.logger.error);
                const url = `https://hastebin.com/${key}`;
                return message.util!.send(`<${url}>`);
            }
            const embed = new MessageEmbed()
                .setTitle(`Executed in ${hrTime[0] > 0 ? `${hrTime[0]}s ` : ''}${hrTime[1] / 1000000}ms.`)
                .addField('Input', `\`\`\`asciidoc\n${code ?? '\n'}\`\`\``)
                .addField('Output', `\`\`\`asciidoc\n${result ?? '\n'}\`\`\``)
                .setTimestamp();
            return message.util!.send(embed);
        });
    }
}