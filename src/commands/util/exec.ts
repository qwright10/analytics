import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { Constants } from '../../structures/util/Constants';
import { exec } from 'child_process';

export default class ExecCommand extends Command {
    public constructor() {
        super('exec', Constants.commands.exec);
    }

    public async exec(message: Message, { code }: { code: string }): Promise<any> {
        let hrTime: [number, number] = process.hrtime();
        return exec(code, { windowsHide: true, shell: 'powershell' }, async (err, stdout): Promise<Message | Message[]> => {
            hrTime = process.hrtime(hrTime);
            let result = (err ?? stdout) as string;
            if (result.length > 1000) {
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