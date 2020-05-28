import { AnalyticsClient } from './AnalyticsClient';
import { getRepository } from 'typeorm';
import { Channel, Emoji, Event, Guild, Message, Presence, Raw, Role, User } from '../structures/db';
import Discord from 'discord.js';
import md5 from 'md5';

export const presenceSymbol = Symbol('presences');

export class MessageHandler {
    public readonly client: AnalyticsClient;
    public cache = new Map<string, any>();
    public queue: any[] = [];
    public readonly intervals = new Map<Symbol, NodeJS.Timeout>();

    public constructor(client: AnalyticsClient) {
        this.client = client;
        this.intervals.set(presenceSymbol, setInterval(this.writePresences.bind(this), 10000));
    }

    public async writePresences(): Promise<void> {
        if (this.queue.length) await getRepository(Presence).insert(this.queue);
        this.queue = [];
    }

    public registerAll(): void {
        // Channels
        this.client.on('channelCreate', this._channelCreate.bind(this));
        this.client.on('channelDelete', this._channelDelete.bind(this));
        this.client.on('channelUpdate', this._channelUpdate.bind(this));
        // Emojis
        this.client.on('emojiCreate', this._emojiCreate.bind(this));
        this.client.on('emojiDelete', this._emojiDelete.bind(this));
        this.client.on('emojiUpdate', this._emojiUpdate.bind(this));
        // Guilds
        this.client.on('guildBanAdd', this._guildBanAdd.bind(this));
        this.client.on('guildBanRemove', this._guildBanRemove.bind(this));
        this.client.on('guildCreate', this._guildCreate.bind(this));
        this.client.on('guildDelete', this._guildDelete.bind(this));
        this.client.on('guildUpdate', this._guildUpdate.bind(this));
        this.client.on('guildMemberAdd', this._guildMemberAdd.bind(this));
        this.client.on('guildMemberRemove', this._guildMemberRemove.bind(this));
        // Messages
        this.client.on('message', this._message.bind(this));
        this.client.on('messageDelete', this._messageDelete.bind(this));
        this.client.on('messageDeleteBulk', this._messageDeleteBulk.bind(this));
        this.client.on('messageReactionAdd', this._messageReactionAdd.bind(this));
        this.client.on('messageReactionRemove', this._messageReactionRemove.bind(this));
        this.client.on('messageReactionRemoveAll', this._messageReactionRemoveAll.bind(this));
        this.client.on('messageUpdate', this._messageUpdate.bind(this));
        // Other
        this.client.on('presenceUpdate', this._presenceUpdate.bind(this));
        this.client.on('raw' as any, this._raw.bind(this));
        this.client.on('roleCreate', this._roleCreate.bind(this));
        this.client.on('roleDelete', this._roleDelete.bind(this));
        this.client.on('roleUpdate', this._roleUpdate.bind(this));
        this.client.on('userUpdate', this._userUpdate.bind(this));
    }

    public reloadAll(): void {
        this.client.off('channelCreate', this._channelCreate.bind(this));
        this.client.off('channelDelete', this._channelDelete.bind(this));
        this.client.off('channelUpdate', this._channelUpdate.bind(this));
        this.client.off('emojiCreate', this._emojiCreate.bind(this));
        this.client.off('emojiDelete', this._emojiDelete.bind(this));
        this.client.off('emojiUpdate', this._emojiUpdate.bind(this));
        this.client.off('guildBanAdd', this._guildBanAdd.bind(this));
        this.client.off('guildBanRemove', this._guildBanRemove.bind(this));
        this.client.off('guildCreate', this._guildCreate.bind(this));
        this.client.off('guildDelete', this._guildDelete.bind(this));
        this.client.off('guildUpdate', this._guildUpdate.bind(this));
        this.client.off('guildMemberAdd', this._guildMemberAdd.bind(this));
        this.client.off('guildMemberRemove', this._guildMemberRemove.bind(this));
        this.client.off('message', this._message.bind(this));
        this.client.off('messageDelete', this._messageDelete.bind(this));
        this.client.off('messageDeleteBulk', this._messageDeleteBulk.bind(this));
        this.client.off('messageReactionAdd', this._messageReactionAdd.bind(this));
        this.client.off('messageReactionRemove', this._messageReactionRemove.bind(this));
        this.client.off('messageReactionRemoveAll', this._messageReactionRemoveAll.bind(this));
        this.client.off('messageUpdate', this._messageUpdate.bind(this));
        this.client.off('presenceUpdate', this._presenceUpdate.bind(this));
        this.client.off('roleCreate', this._roleCreate.bind(this));
        this.client.off('roleDelete', this._roleDelete.bind(this));
        this.client.off('roleUpdate', this._roleUpdate.bind(this));
        this.client.off('userUpdate', this._userUpdate.bind(this));
        this.registerAll();
    }

    private _channelCreate(channel: any): void {
        const data = {
            id: channel.id,
            name: channel instanceof Discord.DMChannel ? channel.recipient.tag : channel.name,
            guild: channel instanceof Discord.DMChannel ? null : channel.guild.id,
            deleted: false,
            createdAt: dateToPG(channel.createdAt),
            type: channel.type,
            parent: channel instanceof Discord.DMChannel ? null : channel.parentID!,
            permissionOverwrites: channel instanceof Discord.DMChannel ? null : channel.permissionOverwrites!.toJSON(),
            topic: channel instanceof Discord.TextChannel ? channel.topic : null,
            edits: {
                name: [],
                parent: [],
                permissionOverwrites: [],
                topic: []
            }
        };

        getRepository(Channel).insert(data);
    }

    private _channelDelete(channel: Discord.Channel): void {
        getRepository(Channel).update(channel.id, { deleted: true });
    }

    private async _channelUpdate(oldChannel: any, newChannel: any): Promise<void> {
        const record = await getRepository(Channel).findOne(oldChannel.id);
        if (!record) return;

        let [name, parent, permissionOverwrites, topic] = [
            record.edits.name,
            record.edits.parent,
            record.edits.permissionOverwrites,
            record.edits.topic
        ];
        const channelName = oldChannel instanceof Discord.DMChannel ? oldChannel.recipient.tag : oldChannel.name;
        if (channelName !== record.name) {
            name.push({ at: Date.now(), from: record.name, to: channelName });
            record.name = channelName;
        }
        if (oldChannel instanceof Discord.GuildChannel && oldChannel.parentID !== record.parent) {
            parent.push({ at: Date.now(), from: record.parent!, to: (newChannel as Discord.GuildChannel).parentID! });
            record.parent = oldChannel.parentID;
        }
        if (oldChannel instanceof Discord.GuildChannel && oldChannel.permissionOverwrites !== record.permissionOverwrites) {
            permissionOverwrites.push({ at: Date.now(), from: record.permissionOverwrites!, to: (newChannel as Discord.GuildChannel).permissionOverwrites.toJSON() });
            record.permissionOverwrites = (newChannel as Discord.GuildChannel).permissionOverwrites.toJSON();
        }
        if (oldChannel instanceof Discord.TextChannel && oldChannel.topic !== record.topic) {
            topic.push({ at: Date.now(), from: record.topic, to: (newChannel as Discord.TextChannel).topic });
            record.topic = (newChannel as Discord.TextChannel).topic;
        }

        getRepository(Channel).update(oldChannel.id, { edits: { name, parent, permissionOverwrites }});
    }

    private _emojiCreate(emoji: Discord.GuildEmoji): void {
        const data = {
            id: emoji.id,
            createdAt: dateToPG(emoji.createdAt),
            deleted: false,
            name: emoji.name,
            url: emoji.url,
            edits: {
                name: []
            }
        };

        getRepository(Emoji).insert(data);
    }

    private _emojiDelete(emoji: Discord.GuildEmoji): void {
        getRepository(Emoji).update(emoji.id, { deleted: true });
    }

    private async _emojiUpdate(oldEmoji: Discord.GuildEmoji, newEmoji: Discord.GuildEmoji): Promise<void> {
        const record = await getRepository(Emoji).findOne(oldEmoji.id);
        if (!record) return;

        if (record.name !== newEmoji.name) {
            record.edits.name.push({ at: Date.now(), from: record.name, to: newEmoji.name });
            record.name = newEmoji.name;
        }

        getRepository(Emoji).update(oldEmoji.id, record);
    }

    private async _guildBanAdd(guild: Discord.Guild, user: Discord.User | Discord.PartialUser): Promise<void> {
        const record = await getRepository(Guild).findOne(guild.id);
        if (!record) return;

        record.bans.push(user.id);
        getRepository(Guild).update(guild.id, record);
    }

    private async _guildBanRemove(guild: Discord.Guild, user: Discord.User | Discord.PartialUser): Promise<void> {
        const record = await getRepository(Guild).findOne(guild.id);
        if (!record) return;

        record.bans.splice(record.bans.indexOf(user.id), 1);
        getRepository(Guild).update(guild.id, record);
    }

    private async _guildCreate(guild: Discord.Guild): Promise<void> {
        let members: any = await guild.members.fetch();
        const data = {
            id: guild.id,
            owner: guild.ownerID,
            name: guild.name,
            description: guild.description,
            createdAt: dateToPG(guild.createdAt),
            deleted: false,
            joins: [],
            leaves: [],
            bans: await guild.fetchBans().then(b => b.array().map(e => e.user.id)).catch(() => []),
            edits: {
                description: [],
                name: []
            }
        };

        getRepository(Guild).insert(data);

        members.forEach(this._guildMemberAdd.bind(this));
        guild.channels.cache.forEach(this._channelCreate.bind(this));
        guild.roles.cache.forEach(this._roleCreate.bind(this));
        guild.emojis.cache.forEach(this._emojiCreate.bind(this));
    }

    private _guildDelete(guild: Discord.Guild): void {
        getRepository(Guild).update(guild.id, { deleted: true });
    }

    private async _guildMemberAdd(member: Discord.GuildMember | Discord.PartialGuildMember): Promise<void> {
        if (member.partial) await member.fetch(); 
        let userRecord: any = await getRepository(User).findOne(member.id);

        if (!userRecord) {
            const data = {
                id: member.id,
                tag: member.user!.tag,
                avatar: member.user?.avatar ?? null,
                guilds: [member.guild.id],
                joins: [{ at: Date.now(), id: member.guild.id }],
                leaves: [],
                edits: {
                    tag: [],
                    avatar: []
                }
            };
            
            await getRepository(User).insert(data);
            userRecord = data;
        }

        const data = {
            type: 'GUILD_MEMBER_ADD',
            data: {
                guild: member.guild.id,
                at: member.joinedTimestamp ?? Date.now(),
                id: member.id
            }
        };

        userRecord.guilds.push(member.guild.id);
        getRepository(Event).insert(data as any);
        getRepository(User).update(member.id, userRecord);
    }

    private async _guildMemberRemove(member: Discord.GuildMember | Discord.PartialGuildMember): Promise<void> {
        const record = await getRepository(User).findOne(member.id);
        if (!record) return;

        const data = {
            type: 'GUILD_MEMBER_REMOVE',
            data: {
                guild: member.guild.id,
                at: Date.now(),
                id: member.id
            }
        };

        record.guilds.splice(record.guilds.indexOf(member.guild.id), 1);
        record.leaves.push({ at: Date.now(), id: member.id });
        
        getRepository(Event).insert(data as any);
        getRepository(User).update(member.id, record);
    }

    private async _guildUpdate(oldGuild: Discord.Guild, newGuild: Discord.Guild): Promise<void> {
        const record = await getRepository(Guild).findOne(oldGuild.id);
        if (!record) return;

        if (record.description !== newGuild.description) {
            record.edits.description.push({ at: Date.now(), from: record.description, to: newGuild.description });
            record.description = newGuild.description;
        }
        if (record.name !== newGuild.name) {
            record.edits.name.push({ at: Date.now(), from: record.name, to: newGuild.name });
            record.name = newGuild.name;
        }

        getRepository(Guild).update(oldGuild.id, record);
    }

    private _message(message: Discord.Message): void {
        const data = {
            id: message.id,
            author: message.author.id,
            channel: message.channel.id,
            guild: message.guild?.id || null,
            content: md5(message.content),
            deleted: false,
            createdAt: message.createdAt.toISOString().replace('T', ' ').replace('Z', ''),
            embeds: message.embeds.map(e => e.toJSON()),
            reactions: [],
            edits: {
                content: [],
                embeds: []
            }
        };

        getRepository(Message)
            .createQueryBuilder()
            .insert()
            .values(data)
            .onConflict('DO NOTHING')
            .execute();
    }

    private _messageDelete(message: Discord.Message | Discord.PartialMessage): void {
        getRepository(Message).update(message.id, { deleted: true });
    }

    private _messageDeleteBulk(messages: Discord.Collection<string, Discord.Message | Discord.PartialMessage>): void {
        for (const [id] of messages) {
            getRepository(Message).update(id, { deleted: true });
        }
    }

    private async _messageReactionAdd(reaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser): Promise<void> {
        const record = await getRepository(Message).findOne(reaction.message.id);
        if (!record) return;

        record.reactions.push({ at: Date.now(), id: reaction.emoji.identifier, user: user.id });
        getRepository(Message).update(reaction.message.id, record);
    }

    private async _messageReactionRemove(reaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser): Promise<void> {
        const record = await getRepository(Message).findOne(reaction.message.id);
        if (!record) return;

        record.reactions = record.reactions.filter(v => v.id !== reaction.emoji.identifier && v.user !== user.id);
        getRepository(Message).update(reaction.message.id, record);
    }

    private _messageReactionRemoveAll(message: Discord.Message | Discord.PartialMessage): void {
        getRepository(Message).update(message.id, { reactions: [] });
    }

    private async _messageUpdate(oldMessage: Discord.Message | Discord.PartialMessage, newMessage: Discord.Message | Discord.PartialMessage): Promise<void> {
        if (newMessage.partial) await newMessage.fetch();
        const record = await getRepository(Message).findOne(oldMessage.id);
        if (!record) return console.log('Message not found');

        if (record.content !== md5(newMessage.content!)) {
            record.edits.content.push({ at: Date.now(), from: record.content, to: md5(newMessage.content!) });
            record.content = md5(newMessage.content!);
        }
        if (record.embeds !== newMessage.embeds!.map(e => e.toJSON())) {
            record.edits.embeds.push({ at: Date.now(), from: record.embeds, to: newMessage.embeds!.map(e => e.toJSON()) });
            record.embeds = newMessage.embeds!.map(e => e.toJSON());
        }

        getRepository(Message).update(oldMessage.id, record);
    }

    private async _presenceUpdate(_: Discord.Presence | undefined, newPresence: Discord.Presence): Promise<void> {
        if (newPresence.user?.bot || !newPresence.userID) return;

        const data = {
            id: newPresence.userID,
            at: dateToPG(new Date()),
            presence: newPresence ? {
                activities: newPresence.activities,
                clientStatus: newPresence.clientStatus,
                guild: newPresence.guild?.id ?? null,
                status: newPresence.status
            } : null
        };

        getRepository(Presence).insert(data);
        getRepository(User).increment({ id: newPresence.userID }, 'presences', 1);
    }

    private async _raw(message: any): Promise<any> {
        const count = await getRepository(Raw).count({ op: message.op, t: message.t });
        if (count > 0) return getRepository(Raw).increment({ op: message.op, t: message.t }, 'count', 1);

        const data = {
            time: dateToPG(new Date()),
            op: message.op,
            t: message.t
        };

        getRepository(Raw).insert(data);
    }

    private _roleCreate(role: Discord.Role): void {
        const data = {
            id: role.id,
            name: role.name,
            guild: role.guild.id,
            color: role.color,
            deleted: role.deleted,
            managed: role.managed,
            permissions: role.permissions.bitfield,
            edits: {
                name: [],
                color: [],
                permissions: []
            }
        };

        getRepository(Role).insert(data);
    }

    private _roleDelete(role: Discord.Role): void {
        getRepository(Role).update(role.id, { deleted: true });
    }

    private async _roleUpdate(oldRole: Discord.Role, newRole: Discord.Role): Promise<void> {
        const record = await getRepository(Role).findOne(oldRole.id);
        if (!record) return;

        if (record.name !== newRole.name) {
            record.edits.name.push({ at: Date.now(), from: record.name, to: newRole.name });
            record.name = newRole.name;
        }
        if (record.color !== newRole.color) {
            record.edits.color.push({ at: Date.now(), from: record.color, to: newRole.color });
            record.color = newRole.color;
        }
        if (record.permissions !== newRole.permissions.bitfield) {
            record.edits.permissions.push({ at: Date.now(), from: record.permissions, to: newRole.permissions.bitfield });
            record.permissions = newRole.permissions.bitfield;
        }

        getRepository(Role).update(oldRole.id, record);
    }

    private async _userUpdate(oldUser: Discord.User | Discord.PartialUser, newUser: Discord.User | Discord.PartialUser): Promise<void> {
        if (newUser.partial) await newUser.fetch();
        const record = await getRepository(User).findOne(oldUser.id);
        if (!record) return;

        if (record.tag !== oldUser.tag) {
            record.edits.tag.push({ at: Date.now(), from: record.tag, to: newUser.tag });
            record.tag = newUser.tag!;
        }
        if (record.avatar !== newUser.avatar ?? null) {
            record.edits.avatar.push({ at: Date.now(), from: record.avatar, to: newUser.avatar ?? null });
            record.avatar = newUser.avatar ?? null;
        }

        getRepository(User).update(oldUser.id, record);
    }
}

function dateToPG(date: Date): string {
    return date.toISOString().replace('T', ' ').replace('Z', '');
}