import { ShardingManager } from 'discord.js';
const manager = new ShardingManager('./build/index.js', { totalShards: 5 });
manager.on('shardCreate', (shard) => console.log(shard.id, 'spawned'));
manager.spawn();