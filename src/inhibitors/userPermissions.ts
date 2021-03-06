import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';
import { Constants } from '../structures/util/Constants';

export default class UserPermissionsInhibitor extends Inhibitor {
    public constructor() {
        super('user-permissions', Constants.inhibitors.userPermissions);
    }

    public async exec(message: Message): Promise<boolean> {
        const { command } = await this.client.commandHandler.parseCommand(
            message
        );
        if (!command) return false;

        const missing = message.member?.permissions.missing(
            command.userPermissions as any
        );
        if (!missing || missing.length === 0) return false;

        if (
            message.guild?.me
                ?.permissionsIn(message.channel)
                .has('SEND_MESSAGES')
        ) {
            message.util!.send(
                `Missing permissions: ${missing
                    .map((p) => `\`${p}\``)
                    .join(' ')}`
            );
        }

        return true;
    }
}
