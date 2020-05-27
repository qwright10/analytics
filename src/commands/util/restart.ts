import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class RestartCommand extends Command {
    public constructor() {
        super('restart', {
            aliases: ['restart', 'shutdown'],
            description: 'Restarts the bot.',
            category: 'util',
            ownerOnly: true
        });
    }

    public async exec(message: Message): Promise<any> {
        const restart = await this.client.utils.prompt('Are you sure you want to restart?', message);
        if (restart === null || restart === false) return message.util!.send('Cancelling');
        await message.util!.send('> Restarting shards in 3 seconds');
        
        this.client.setTimeout(async () => {
            this.client.shard!.respawnAll();
        }, 3000);
    }
}