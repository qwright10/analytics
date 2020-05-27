import { Listener } from 'discord-akairo';

export default class ReadyListener extends Listener {
    public constructor() {
        super('ready', {
            event: 'ready',
            emitter: 'client',
            category: 'client'
        });
    }

    public async exec(): Promise<void> {
        this.client.logger.info(`Logged in as ${this.client.user?.tag ?? 'unknown'}`);
        this.client.user?.setStatus('dnd');
    }
}