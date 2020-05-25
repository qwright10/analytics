import { Listener } from 'discord-akairo';
import { MessageReaction, User } from 'discord.js';

export default class MessageReactionAddListener extends Listener {
    public constructor() {
        super('messageReactionAdd', {
            event: 'messageReactionAdd',
            emitter: 'client',
            category: 'client'
        });
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

        // If both the reactor and bot can delete messages
        if (
            reaction.message.guild.member(user)?.permissions.has('MANAGE_MESSAGES')
            && reaction.message.guild.me?.permissions.has('MANAGE_MESSAGES')
        ) return reaction.message.delete();

        // If the "author" of the embed is not the reactor
        if (!this.client.embeds.has(reaction.message.id)) return;

        // If the bot can delete the message
        if (reaction.message.guild.me?.permissions.has('MANAGE_MESSAGES')) reaction.message.delete();
    }
}