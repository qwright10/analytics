import { Command } from 'discord-akairo';
import { Channel, Message, MessageEmbed } from 'discord.js';
import { Constants } from '../../structures/util/Constants';
import { getRepository } from 'typeorm';
import {
    Channel as CEntity,
    Guild as GEntity,
    Message as MEntity,
} from '../../structures/db';

export default class ChannelCommand extends Command {
    public constructor() {
        super('channel', Constants.commands.channel);
    }

    public async exec(
        message: Message,
        { channel }: { channel: Channel }
    ): Promise<Message | Message[]> {
        const id = channel.id;

        const channelRecord: any =
            (await getRepository(CEntity).findOne({ id })) ||
            this.client.channels.cache.get(id);
        const guildRecord = await getRepository(GEntity).findOne({
            id:
                channel instanceof CEntity
                    ? channel.guild
                    : (channel as any).guild.id,
        });
        const messages = await getRepository(MEntity).count({ channel: id });

        if (!channel)
            return message.util!.send(
                'A channel record or client channel with that ID was not found.'
            );
        if (channel instanceof CEntity) {
            const embed = new MessageEmbed()
                .setTitle(`Stats for ${channelRecord.name || channelRecord.id}`)
                .setDescription(`Using record #${channelRecord.uid}`)
                .addField(
                    'Name (ID)',
                    `${channelRecord.name} (${channelRecord.id})`
                )
                .addField('Type', channelRecord.type)
                .addField('Message Count', messages)
                .addField('Parent ID', channelRecord.parent);
            if (guildRecord)
                embed.addField(
                    'Guild (ID)',
                    `${guildRecord.name} (${guildRecord.id})`
                );
            embed
                .addField('Topic', channelRecord.topic || 'None')
                .addField('Created At', channel.createdAt.toLocaleString());
            return message.util!.send(embed);
        }

        const { name, type, parent, guild, topic } = channel as any;
        const embed = new MessageEmbed()
            .setTitle(`Stats for ${name || channel.id}`)
            .addField('Name (ID)', `${name} (${id})`)
            .addField('Type', type)
            .addField('Parent ID', parent);
        if (guild) embed.addField('Guild (ID)', `${guild.name} (${guild.id})`);
        embed
            .addField('Topic', topic || 'None')
            .addField('Created At', channel.createdAt.toLocaleString());
        return message.util!.send(embed);
    }
}
