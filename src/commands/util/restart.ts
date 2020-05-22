import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { getConnection } from 'typeorm';
import { presenceSymbol } from '../../client/MessageHandler';

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
        await message.util!.send('> Restarting in 3 seconds');
        
        this.client.setTimeout(async () => {
            await this.client.events.writePresences();
            this.client.clearInterval(this.client.events.intervals.get(presenceSymbol)!);
    
            await getConnection().close();
            this.client.logger.log('Closed Postgres connection');
            
            this.client.destroy();
            this.client.logger.log('Client destroyed, shutting down');
            process.exit(0);
        }, 3000);
    }
}