import { Command } from 'discord-akairo';
import { Message, MessageEmbed, User } from 'discord.js';
import { getRepository } from 'typeorm';
import { PresenceCount, User as UEntity } from '../../structures/db/';

export default class PresencesCommand extends Command {
    public constructor() {
        super('presences', {
            aliases: ['presence', 'presences'],
            description: 'Provides statistics about presences.',
            category: 'stats',
            channel: 'guild',
            cooldown: 5000,
            ratelimit: 1,
            clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
            args: [
                {
                    id: 'user',
                    type: 'user',
                    default: (message: Message) => message.author
                }
            ]
        });
    }

    public async exec(message: Message, { user }: { user: User }): Promise<Message | Message[]> {
        const totalPresences = await getRepository(PresenceCount)
            .createQueryBuilder()
            .select('c')
            .take(1)
            .execute()
            .then(r => parseInt(r[0]?.c)?.toLocaleString());
        const userPresences = await getRepository(UEntity)
            .createQueryBuilder()
            .select('presences')
            .where('id = :id', { id: user.id })
            .execute()
            .then(r => r[0]?.presences?.toLocaleString());
        const embed = new MessageEmbed()
            .setTitle(`Stats for ${user.username}`)
            .addField('Total Presence Updates', totalPresences ?? 'Unknown')
            .addField('User Presence Updates', userPresences ?? 'Unknown')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp();
        return message.util!.send(embed);
    }
}