import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

const prefixRegex = /^[?!@#$%^&*()_+-=[\]{}|;':",.<>/`~\w\d\s\u200D\u200B]{1,5}$/i;

export default class PrefixCommand extends Command {
    public constructor() {
        super('settings-prefix', {
            aliases: ['prefix', 'setprefix'],
            description: 'Gets, sets, or resets/clears the guild prefix.',
            category: 'settings',
            channel: 'guild',
            cooldown: 5000,
            ratelimit: 2,
            clientPermissions: ['SEND_MESSAGES'],
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    id: 'method',
                    default: 'get'
                },
                {
                    id: 'newPrefix'
                }
            ]
        });
    }

    public async exec(message: Message, { method, newPrefix }: { method: string, newPrefix: string }): Promise<Message | Message[]> {
        const prefix = await this.client.settings.get(message.guild!, 'prefix', undefined);
        if (!prefix) return message.util!.send('There was an error fetching guild settings.');
        if (method === 'get') {
            const msg = `\`${message.guild!.name}\`'s current prefix is \`${prefix}\``;
            return message.util!.send(msg);
        } else if (method === 'set') {
            if (!prefixRegex.test(newPrefix)) {
                const msg = 'Prefixes can only be 1 to 5 characters.';
                return message.util!.send(msg);
            }
            this.client.settings.set(message.guild!, 'prefix', newPrefix);
            const msg = `\`${message.guild!}\`'s prefix is now \`${newPrefix}\``;
            return message.util!.send(msg);
        } else if (method === 'clear' || method === 'reset') {
            if (prefix === this.client.settings.defaults.prefix) {
                const msg = `\`${message.guild!.name}\`'s prefix is already the default prefix.`;
                return message.util!.send(msg);
            }
            const np = await this.client.settings.reset(message.guild!, 'prefix');
            const msg = `\`${message.guild!.name}\`'s prefix was reset to \`${np.prefix}\``;
            return message.util!.send(msg);
        } else {
            if (!method) {
                const msg = `\`${message.guild!.name}\`'s current prefix is \`${prefix}\``;
                return message.util!.send(msg);
            }
            
            if (!prefixRegex.test(method)) {
                const msg = 'Prefixes have to be 1 to 5 characters.';
                return message.util!.send(msg);
            }
            this.client.settings.set(message.guild!, 'prefix', method);
            const msg = `\`${message.guild!}\`'s prefix is now \`${method}\``;
            return message.util!.send(msg);
        }
    }
}