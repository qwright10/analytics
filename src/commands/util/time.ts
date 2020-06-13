import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Constants } from '../../structures/util/Constants';

export default class TimeCommand extends Command {
    public constructor() {
        super('time', Constants.commands.time);
    }

    public async exec(
        message: Message,
        { rest }: { rest: string }
    ): Promise<Message | Message[]> {
        const m = await message.channel.send('> Timing...');
        let hrDiff: [number, number] = process.hrtime();

        message.content = rest;
        await this.handler.handle(message);
        hrDiff = process.hrtime(hrDiff);

        return m.edit(
            `${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${
                hrDiff[1] / 1000000
            }ms to execute`
        );
    }
}
