import { ShardingManager, Shard } from 'discord.js';
import { Logger } from './structures/util/Logger';
import { filename } from './client/MessageHandler';
import { fork } from 'child_process';

const events = fork(filename);
events.stdout?.pipe(process.stdout);

const options: any = {
    totalShards: 2,
    respawn: true,
    mode: 'worker',
    execArgv: [
        '--experimental-worker',
        '--expose-gc',
        '--max_old_space_size=4096',
        '--trace-warnings',
    ],
};

const manager = new ShardingManager('./build/start.js', options);
manager.on('shardCreate', (shard: Shard) => {
    shard.on('spawn', () => Logger.info(`Shard ${shard.id} spawned`));
    shard.on('ready', () => Logger.info(`Shard ${shard.id} ready`));
    shard.on('disconnect', () =>
        Logger.error(`Shard ${shard.id} disconnected`)
    );
    shard.on('error', (error: Error) =>
        Logger.error(`Shard ${shard.id} error: ${error}`)
    );
    shard.on('message', (message) => {
        try {
            if (typeof message === 'string') message = JSON.parse(message);
            if (typeof message !== 'object') return;
        } catch {
            return;
        }

        manager.shards.get(message.shard)?.respawn();
    });
});
manager.spawn();
