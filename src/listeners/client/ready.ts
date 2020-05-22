import { Listener } from 'discord-akairo';
import { getRepository } from 'typeorm';
import { Stats } from '../../structures/db';

export default class ReadyListener extends Listener {
    public constructor() {
        super('ready', {
            event: 'ready',
            emitter: 'client',
            category: 'client'
        });
    }

    public get memberCount() {
        return this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);
    }

    public async exec(): Promise<void> {
        this.client.logger.info(`Logged in as ${this.client.user?.tag ?? 'unknown'}`);
        this.client.user?.setPresence({
            activity: {
                name: `${this.memberCount ?? 'some'} users`,
                type: 'WATCHING'
            },
            status: 'dnd'
        });

        const stats = getRepository(Stats);
        this.client.setInterval(() => {
            if (!this.client.uptime) return;
            this.client.logger.log('Inserted stats row');
            stats.insert({
                time: new Date().toISOString().replace('T', ' ').replace('Z', ''),
                guilds: this.client.guilds.cache.size,
                members: this.memberCount,
                cpu: process.cpuUsage(),
                memory: process.memoryUsage()
            });
        }, 5000);
    }
}