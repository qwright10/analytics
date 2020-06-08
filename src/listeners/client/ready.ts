import { Listener } from 'discord-akairo';
import { Constants } from '../../structures/util/Constants';

export default class ReadyListener extends Listener {
    public constructor() {
        super('ready', Constants.listeners.ready);
    }

    public async exec(): Promise<void> {
        this.client.logger.info(`Logged in as ${this.client.user?.tag ?? 'unknown'}`);
    }
}