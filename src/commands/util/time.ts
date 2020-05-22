import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class TimeCommand extends Command {
    public constructor() {
        super('time', {
            aliases: ['time'],
            description: 'Times the execution of a command.',
            category: 'util',
            ownerOnly: true,
            args: [
                {
                    id: 'rest',
                    match: 'restContent'
                }
            ]
        });
    }

    public async exec(message: Message, { rest }: { rest: string }): Promise<Message | Message[]> {
        const m = await message.channel.send('> Timing...');
        let hrDiff: [number, number] = process.hrtime();

        message.content = rest;
        await this.handler.handle(message);
        hrDiff = process.hrtime(hrDiff);
        
        return m.edit(`${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms to execute`);
    }
}