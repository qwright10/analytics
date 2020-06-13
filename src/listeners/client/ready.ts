import { Listener } from 'discord-akairo';
import { Constants } from '../../structures/util/Constants';
import { getRepository } from 'typeorm';
import { Stats } from '../../structures/db';

export default class ReadyListener extends Listener {
    public constructor() {
        super('ready', Constants.listeners.ready);
    }

    public async exec(): Promise<void> {
        this.client.logger.info(
            `Logged in as ${this.client.user?.tag ?? 'unknown'}`
        );
        this.client.setInterval(() => {
            getRepository(Stats).insert({
                timestamp: this.client.utils.pgify(),
                shard: this.client.shard!.ids[0],
                type: 'client',
                data: {
                    guilds: this.client.guilds.cache.size,
                    channels: this.client.channels.cache.size,
                    members: this.client.guilds.cache.reduce(
                        (a, b) => a + b.memberCount,
                        0
                    ),
                    cpu: process.cpuUsage(),
                    memory: process.memoryUsage(),
                    latency: this.client.ws.ping,
                },
            } as any);
        }, 3e5);
    }
}
