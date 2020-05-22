import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PingCommand extends Command {
    public constructor() {
        super('ping', {
            aliases: ['ping', 'pong'],
            description: 'Gets the latency to Discord\'s API',
            category: 'util',
            clientPermissions: ['SEND_MESSAGES'],
            ratelimit: 2
        });
    }

    public async exec(message: Message): Promise<Message> {
        const m = await message.channel.send('Pinging...');
        return m.edit(`🏓 ${Math.round(this.client.ws.ping)}ms`);
    }
}