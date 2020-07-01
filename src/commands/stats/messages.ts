import { Command } from 'discord-akairo';
import { Message, MessageEmbed, TextChannel, User } from 'discord.js';
import { Constants } from '../../structures/util/Constants';
import { getRepository } from 'typeorm';
import {
    Channel as CEntity,
    Guild as GEntity,
    Message as MEntity,
    User as UEntity,
} from '../../structures/db/';
import sha1 from 'sha1';

export default class MessagesCommand extends Command {
    public constructor() {
        super('messages', Constants.commands.messages);
    }

    public async exec(
        message: Message,
        {
            content,
            channel,
            user,
        }: { content: string | null; channel: TextChannel; user: User }
    ): Promise<Message | Message[] | void> {
        if (content) {
            const results = await getRepository(MEntity).find({
                content: sha1(content),
            });
            if (!results.length) return message.util!.send('No results found');
            let index = 0;
            const author = await this.client.users
                .fetch(results[index].author)
                .catch(() => null);
            return this.client.utils.paginate(
                message,
                results,
                (item, index) => {
                    return new MessageEmbed()
                        .setTitle(`${results.length} results`)
                        .addField('Content Hash', item.content)
                        .addField('Author', author || item.author)
                        .addField('Deleted', item.deleted ? 'Yes' : 'No')
                        .addField(
                            'Sent At',
                            new Date(item.createdAt).toLocaleString()
                        )
                        .addField(
                            'Edits',
                            `Content: ${item.edits.content.length} Embeds: ${item.edits.embeds.length}`
                        )
                        .setFooter(
                            `${index + 1} of ${results.length}`,
                            message.author.displayAvatarURL()
                        );
                }
            );
        }

        if (!channel.guild || channel.guild.id !== message.guild?.id)
            return message.util!.send(
                'This can only be used with text channels from this guild.'
            );

        const guildMessages = await this._count(GEntity, channel.guild.id);
        const channelMessages = await this._count(CEntity, channel.id);
        const userMessages = await this._count(UEntity, user.id);
        const embed = new MessageEmbed()
            .setTitle(`Stats for ${user.tag} in ${channel.name}`)
            .addField('Guild Messages', guildMessages?.messages ?? '0')
            .addField('Channel Messages', channelMessages?.messages ?? '0')
            .addField('User Messages', userMessages?.messages ?? '0')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp();
        return message.util!.send(embed);
    }

    private _count<T = Promise<{ messages: number }>>(
        repo: any,
        id: any
    ): Promise<T | undefined> {
        return getRepository<T>(repo).findOne(id, {
            select: ['messages' as any],
        });
    }
}
