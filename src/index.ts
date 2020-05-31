import { ShardingManager, Shard } from 'discord.js';
import { Logger } from './structures/util/Logger';
require('dotenv').config({ path: `${__dirname}/../.env` });

const options = {
    totalShards: parseInt(process.env.shards ?? '2'),
    respawn: true,
    mode: 'process',
    execArgv: ['--expose-gc', '--trace-warnings', '--max_old_space_size=24576', '--experimental-worker', '--inspect']
};

const manager = new ShardingManager('./build/start.js', options as any);
manager.on('shardCreate', (shard: Shard) => {
    shard.on('spawn', () => Logger.info(`Shard ${shard.id} spawned`));
    shard.on('ready', () => Logger.info(`Shard ${shard.id} ready`));
    shard.on('disconnect', () => Logger.error(`Shard ${shard.id} disconnected`));
    shard.on('error', (error: Error) => Logger.error(`Shard ${shard.id} error: ${error}`));
});
manager.spawn();