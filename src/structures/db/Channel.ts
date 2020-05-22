import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity()
export class Channel {
    @Generated()
    @Column({ name: 'uid' })
    uid!: number;

    @PrimaryColumn({ name: 'id', type: 'text' })
    id!: string;

    @Column({ name: 'name', type: 'text' })
    name!: string;

    @Column({ name: 'guild', type: 'text', nullable: true })
    guild!: string | null;

    @Column({ name: 'deleted', type: 'boolean' })
    deleted!: boolean;

    @Column({ name: 'createdAt', type: 'timestamp without time zone' })
    createdAt!: string;

    @Column({ name: 'type', type: 'text' })
    type!: 'dm' | 'text' | 'voice' | 'category' | 'news' | 'store' | 'unknown';

    @Column({ name: 'parent', type: 'text', nullable: true })
    parent!: string | null;

    @Column({ name: 'permissionOverwrites', type: 'json', nullable: true })
    permissionOverwrites!: object | null;

    @Column({ name: 'topic', type: 'text', nullable: true })
    topic!: string | null;

    @Column({ name: 'edits', type: 'json' })
    edits!: { [type: string]: { at: number; from: any; to: any }[]};
}