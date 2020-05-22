import { Command } from 'discord-akairo';
import { Message, MessageEmbed, User } from 'discord.js';
import { getConnection, /* getRepository */ } from 'typeorm';
import { PresenceCount } from '../../structures/db/';

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
        const totalPresences = await getConnection()
            .createQueryBuilder()
            .select('c')
            .from(PresenceCount, 'presence_count')
            .execute();
        const userPresences = 5; // await getRepository(Presence).count({ id: user.id }).then(r => r.toLocaleString());
        const embed = new MessageEmbed()
            .setTitle(`Stats for ${user.username}`)
            .addField('Total Presence Updates', totalPresences[0]?.c.toLocaleString() ?? 'Unknown')
            .addField('User Presence Updates', userPresences)
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp();
        return message.util!.send(embed);
    }
}