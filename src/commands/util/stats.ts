import Akairo, { Command } from 'discord-akairo';
import Discord, { Message, MessageEmbed, WebSocketShard } from 'discord.js';
import { Constants } from '../../structures/util/Constants';

import os from 'os';
import moment from 'moment';
import 'moment-duration-format';
import { stripIndents } from 'common-tags';
import { execSync } from 'child_process';

export default class StatsCommand extends Command {
    public constructor() {
        super('stats', Constants.commands.stats);
    }

    public async exec(message: Message): Promise<Message | Message[]> {
        const cpu = `CPU: ${os.cpus()[0].model}`;
        const ramstats = [os.freemem() / 1024 / 1024 / 1024, os.totalmem() / 1024 / 1024 / 1024];
        const ram = `RAM: ${ramstats[0].toFixed(2)}GB of ${ramstats[1].toFixed(2)}GB`;
        const arch = `Arch: ${os.platform()}`;
        // @ts-ignore
        const uptime = moment.duration(this.client.uptime ?? 0).format('d[d ]h[h ]m[m ]s[s]');

        const node = `Node: ${process.version}`;
        const discord = `D.JS: v${Discord.version}`;
        const akairo = `Akairo: v${Akairo.version}`;
        const commit = execSync(`cd '${__dirname}'; git rev-parse HEAD`, { shell: 'powershell', windowsHide: true }).toString();

        const guilds = await this.client.shard!.fetchClientValues('guilds.cache.size')
            .then(r => 
                r.reduce((a, b) => a + b, 0)
            );
        const channels = await this.client.shard!.fetchClientValues('channels.cache.size')
            .then(r => 
                r.reduce((a, b) => a + b, 0)
            );
        const members = await this.client.shard!.broadcastEval('this.guilds.cache.reduce((a, b) => a + b.memberCount, 0)')
            .then(r => 
                r.reduce((a, b) => a + b, 0)
            );
        const shardStatus = await this.client.shard!.fetchClientValues('ws.shards')
            .then(r => 
                r.reduce((a, b) =>
                    a + b.map((c: WebSocketShard) => ShardStatus[c.status])
                , '')
            );

        const embed = new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setTitle(`${message.guild?.me?.displayName ?? this.client.user!.username} Stats`)
            .setThumbnail(this.client.user!.displayAvatarURL({ size: 2048, dynamic: false }))
            .setTimestamp()
            .addField('Host', stripIndents`\`\`\`asciidoc
                ${cpu}
                ${ram}
                ${arch}
                Uptime: ${uptime}
            \`\`\``)
            .addField('Versions', stripIndents`\`\`\`asciidoc
                ${node}
                ${discord}
                ${akairo}
                Git: ${commit}
            \`\`\``)
            .addField('Stats', stripIndents`\`\`\`asciidoc
                ${guilds} guilds
                ${channels} channels + DMs
                ${members} guild members
                Shards: ${shardStatus}
            \`\`\``)
            .addField('GitHub', 'https://github.com/qwright10/analytics.git');

        return message.channel.send(embed);
    }
}

enum ShardStatus {
    '✅',
    '🟡',
    '⚪',
    '🌙',
    '🔵',
    '🔴',
    '📥',
    '🟣',
    '🟠'
}