import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Constants } from '../../structures/util/Constants';

export default class RestartCommand extends Command {
    public constructor() {
        super('restart', Constants.commands.restart);
    }

    public async exec(
        message: Message,
        { force }: { force: boolean }
    ): Promise<any> {
        if (!force) {
            const restart = await this.client.utils.prompt(
                'Are you sure you want to restart?',
                message
            );
            if (restart === null || restart === false)
                return message.util!.send('Cancelling');
        }

        await message.util!.send('Restarting shards in 3 seconds');

        this.client.setTimeout(() => {
            this.client.shard!.respawnAll();
        }, 3000);
    }
}
