import { Command, PrefixSupplier } from 'discord-akairo';
import {
    Message,
    MessageEmbed,
    Permissions,
    PermissionString,
} from 'discord.js';
import { Constants } from '../../structures/util/Constants';

export default class HelpCommand extends Command {
    public constructor() {
        super('help', Constants.commands.help);
    }

    public async exec(
        message: Message,
        { command }: { command: Command | null }
    ): Promise<Message | Message[]> {
        if (!command) {
            const embed = new MessageEmbed().setTitle(
                `${
                    message.guild?.me?.displayName ?? this.client.user!.username
                } commands`
            );
            for (const [name, category] of this.handler.categories) {
                embed.addField(
                    `${name}`,
                    category.map((c) => `\`${c.id}\``).join(' ')
                );
            }
            embed
                .setFooter(
                    message.author.tag,
                    message.author.displayAvatarURL()
                )
                .setTimestamp();
            return message.util!.send(embed);
        }

        const clientPermissions =
            typeof command.clientPermissions === 'number'
                ? Object.entries(
                      new Permissions(command.clientPermissions).serialize()
                  )
                      .filter((p: any) => p[1])
                      .map((p) => p[0])
                : typeof command.clientPermissions === 'string'
                ? ([command.clientPermissions] as PermissionString[])
                : typeof command.clientPermissions === 'undefined'
                ? ['None']
                : (command.clientPermissions as PermissionString[]);
        const userPermissions =
            typeof command.userPermissions === 'number'
                ? Object.entries(
                      new Permissions(command.userPermissions).serialize()
                  )
                      .filter((p: any) => p[1])
                      .map((p) => p[0])
                : typeof command.userPermissions === 'string'
                ? ([command.userPermissions] as PermissionString[])
                : typeof command.userPermissions === 'undefined'
                ? ['None']
                : (command.userPermissions as PermissionString[]);

        const prefix = await (this.handler.prefix as PrefixSupplier)(message);
        const usage = command.description.usage;
        const embed = new MessageEmbed().setTitle(
            `\`${prefix}${command.id}${usage ? ` ${usage}` : ''}\``
        );
        if (command.aliases.length > 1)
            embed.addField(
                'Aliases',
                command.aliases.map((a) => `\`${a}\``).join(' ')
            );

        embed
            .addField(
                'Description',
                command.description.value.split('\n').length > 1
                    ? `\`\`\`${command.description.value}\`\`\``
                    : command.description.value
            )
            .addField(
                'Client Permissions',
                clientPermissions.map((p) => `\`${p}\``).join(' ')
            )
            .addField(
                'User Permissions',
                userPermissions.map((p) => `\`${p}\``).join(' ')
            )
            .addField('Owner Only', command.ownerOnly ? 'Yes' : 'No');

        if (command.description.examples?.length)
            embed.addField(
                'Examples',
                command.description.examples.map(
                    (e: string) =>
                        `\`${prefix}${command.id}${e ? ` ${e}` : ''}\``
                )
            );
        return message.util!.send(embed);
    }
}
