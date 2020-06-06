import { ShardingManager, Shard } from 'discord.js';
import { Logger } from './structures/util/Logger';
require('dotenv').config({ path: `${__dirname}/../.env` });

const options: any = {
    totalShards: parseInt(process.env.shards ?? '0') || 'auto',
    respawn: true,
    mode: process.env.shardtype as 'process' | 'worker',
    execArgv: ['--inspect', '--experimental-worker']
};

const manager = new ShardingManager('./build/start.js', options);
manager.on('shardCreate', (shard: Shard) => {
    shard.on('spawn', () => Logger.info(`Shard ${shard.id} spawned`));
    shard.on('ready', () => Logger.info(`Shard ${shard.id} ready`));
    shard.on('disconnect', () => Logger.error(`Shard ${shard.id} disconnected`));
    shard.on('error', (error: Error) => Logger.error(`Shard ${shard.id} error: ${error}`));
});
manager.spawn();