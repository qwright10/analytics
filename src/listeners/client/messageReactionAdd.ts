import { Listener } from 'discord-akairo';
import { MessageReaction, User } from 'discord.js';
import { Constants } from '../../structures/util/Constants';

export default class MessageReactionAddListener extends Listener {
    public constructor() {
        super('messageReactionAdd', Constants.listeners.messageReactionAdd);
    }

    public async exec(reaction: MessageReaction, user: User): Promise<any> {
        if (user.bot) return;

        if (reaction.emoji.name !== '🗑️') return;

        /* ---- DM Channels ---- */

        if (reaction.message.guild === null) {
            // If the author is not the bot
            if (reaction.message.author.id !== this.client.user?.id) return;
            return reaction.message.delete();
        }

        /* ---- Guild Channels ---- */

        // If bot can't delete messages
        if (
            !reaction.message.guild.me?.permissions.has('MANAGE_MESSAGES') &&
            reaction.message.author.id !== this.client.user?.id
        )
            return;

        if (
            this.client.embeds.has(reaction.message.id) ||
            reaction.message.member?.permissions.has('MANAGE_MESSAGES') ||
            this.client.isOwner(user.id)
        )
            return reaction.message.delete();

        // If the "author" of the embed is not the reactor
        if (!this.client.embeds.has(reaction.message.id)) return;

        // If the bot can delete the message
        if (reaction.message.guild.me?.permissions.has('MANAGE_MESSAGES'))
            reaction.message.delete();
    }
}
