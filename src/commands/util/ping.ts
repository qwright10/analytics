import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Constants } from '../../structures/util/Constants';

export default class PingCommand extends Command {
    public constructor() {
        super('ping', Constants.commands.ping);
    }

    public async exec(message: Message): Promise<Message> {
        return message.util!.send(`🏓 ${Math.round(this.client.ws.ping)}ms`);
    }
}