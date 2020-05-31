import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { getRepository } from 'typeorm';
import { Channel as CEntity, Guild as GEntity, Message as MEntity } from '../../structures/db';

export default class ChannelCommand extends Command {
    public constructor() {
        super('channel', {
            aliases: ['channel', 'channels'],
            description: 'Provides statistics about channels',
            category: 'stats',
            channel: 'guild',
            cooldown: 5000,
            ratelimit: 1,
            clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
            args: [
                {
                    id: 'id',
                    default: (message: Message) => message.channel.id
                }
            ]
        });
    }

    public async exec(message: Message, { id }: { id: string }): Promise<Message | Message[]> {
        if (!id) return message.util!.send('Invalid channel ID, canceling.');

        const channel = await getRepository(CEntity).findOne({ id }) || this.client.channels.cache.get(id);
        const guildRecord = await getRepository(GEntity).findOne({ id: channel instanceof CEntity ? channel.guild : (channel as any).guild.id });
        const messages = await getRepository(MEntity).count({ channel: id });
        if (!channel) return message.util!.send('A channel record or client channel with that ID was not found.');
        if (channel instanceof CEntity) {
            const embed = new MessageEmbed()
                .setTitle(`Stats for ${channel.name || channel.id}`)
                .setDescription(`Using record #${channel.uid}`)
                .addField('Name (ID)', `${channel.name} (${channel.id})`)
                .addField('Type', channel.type)
                .addField('Message Count', messages)
                .addField('Parent ID', channel.parent);
            if (guildRecord) embed.addField('Guild (ID)', `${guildRecord.name} (${guildRecord.id})`);
            embed.addField('Topic', channel.topic || 'None')
                .addField('Created At', new Date(channel.createdAt).toLocaleString());
            return message.util!.send(embed);
        }

        const { name, type, parent, guild, topic } = channel as any;
        const embed = new MessageEmbed()
            .setTitle(`Stats for ${name || channel.id}`)
            .addField('Name (ID)', `${name} (${id})`)
            .addField('Type', type)
            .addField('Parent ID', parent);
        if (guild) embed.addField('Guild (ID)', `${guild.name} (${guild.id})`);
        embed.addField('Topic', topic || 'None')
            .addField('Created At', channel.createdAt.toLocaleString());
        return message.util!.send(embed);
    }
}