import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { exec } from 'child_process';

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

    public async exec(message: Message, { code }: { code: string }): Promise<any> {
        let hrTime: [number, number] = process.hrtime();
        return exec(code, { windowsHide: true }, async (err, stdout): Promise<Message | Message[]> => {
            hrTime = process.hrtime(hrTime);
            let result = (err ?? stdout) as string;
            if (result.length > 1950) {
                return this.client.utils.upload(result)
                    .then(url =>
                        message.util!.send(
                            new MessageEmbed()
                                .setURL(url)
                                .setDescription(url)
                        )
                    )
                    .catch(reason => 
                        message.util!.send(
                            new MessageEmbed().setDescription(reason)
                        )
                    );
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