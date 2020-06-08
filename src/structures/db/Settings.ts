import { Entity, PrimaryColumn, Column } from 'typeorm';

export interface Settings {
    blacklist: string[];
    hasConfirmed: boolean;
    prefix: string;
}

export const defaults: Settings = {
    blacklist: [],
    hasConfirmed: true,
    prefix: process.env.prefix || 'apu'
};

@Entity()
export class SettingsEntity {
    @PrimaryColumn()
    id!: string;

    @Column({ name: 'data', type: 'json' })
    data!: Settings;
}