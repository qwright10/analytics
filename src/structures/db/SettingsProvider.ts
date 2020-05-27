import { Settings, SettingsEntity, defaults } from './Settings';
import { AnalyticsClient } from '../../client/AnalyticsClient';
import { Collection, Guild } from 'discord.js';
import { getRepository, Repository } from 'typeorm';
import _ from 'lodash';

export class SettingsProvider {
    public readonly cache = new Collection<string, Settings>();
    public readonly defaults = defaults;
    public repository!: Repository<SettingsEntity>;

    public constructor(public readonly client: AnalyticsClient) { }

    public async init(): Promise<this> {
        this.repository = getRepository(SettingsEntity);
        const items = await this.repository.find();
        for (const item of items) this.cache.set(item.id, item.data);
        return this;
    }

    public async get(guild: GuildIDResolvable, query: string, defaultValue: any): Promise<any>;
    public async get(guild: GuildIDResolvable, queries: string[], defaultValue: any): Promise<any[]>;
    public async get(guild: GuildIDResolvable, query: string | string[], defaultValue: any): Promise<any> {
        const id = this.getGuildID(guild);
        if (!this.cache.has(id)) await this.cacheOne(id);

        const item = this.cache.get(id)!;
        let items: string | string[] = query;
        if (items instanceof Array) items = items.map(i => _.get(item, i, defaultValue));
        else items = _.get(item, query);
        return items ?? defaultValue;
    }

    public async set(guild: Guild | string, query: string, value: any): Promise<Settings> {
        const id = this.getGuildID(guild);
        if (!this.cache.has(id)) await this.cacheOne(id);

        const item = this.cache.get(id)!;
        const data = _.set(item, query, value);
        await this.updateOne(id, data);
        return data;
    }

    public create(guild: Guild | string): SettingsEntity {
        const id = this.getGuildID(guild);
        const settings = this.repository.create({ id, data: defaults });
        this.repository.save(settings);
        this.cache.set(id, settings.data);
        return settings;
    }

    public async reset(guild: Guild | string): Promise<Settings>;
    public async reset(guild: Guild | string, query: string): Promise<Settings>;
    public async reset(guild: Guild | string, query?: string): Promise<Settings> {
        const id = this.getGuildID(guild);
        if (!this.cache.has(id)) await this.cacheOne(id);

        if (query) {
            let data = this.cache.get(id)!;
            _.set(data, query, _.get(defaults, query));
            data = await this.updateOne(id, data);
            return data;
        }

        const data = await this.updateOne(id, defaults);
        return data;
    }

    public async delete(guild: Guild | string): Promise<void> {
        const id = this.getGuildID(guild);
        if (this.cache.has(id)) this.cache.delete(id);
        await this.repository.delete(id);
    }

    public async cacheOne(id: string): Promise<Settings> {
        const item = await this.repository.findOne(id);
        if (!item) return Promise.reject(`[SettingsProvider cacheOne] Guild ${id} settings entry not found`);
        this.cache.set(item.id, item.data);
        return item.data;
    }

    public async updateOne(id: string, data: Settings): Promise<Settings> {
        this.cache.set(id, data);
        this.repository.update(id, { id, data });
        return data;
    }

    public update(data: [string, Settings][] | { [id: string]: Settings } | Map<string, Settings>): void {
        if (data instanceof Map) {
            return data.forEach((v, k) => {
                this.cache.set(k, v);
            });
        } else if (data instanceof Array) {
            return data.forEach(d => {
                this.cache.set(d[0], d[1]);
            });
        } else if (data instanceof Object) {
            return this.update(Object.entries(data));
        }
    }

    private getGuildID(guild: GuildIDResolvable): string {
        if (guild instanceof Guild) return guild.id;
        if (typeof guild === 'string') return guild;
        if (guild === null) return '0';
        throw new TypeError('Guild parameter must be a guild instance, a guild ID, 0, or \'global\'');
    }
}

type GuildIDResolvable = Guild | string | null;