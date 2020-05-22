import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity()
export class Message {
    @Generated()
    @Column({ name: 'uid' })
    uid!: number;

    @PrimaryColumn({ name: 'id', type: 'text' })
    id!: string;

    @Column({ name: 'author', type: 'text' })
    author!: string;

    @Column({ name: 'channel', type: 'text' })
    channel!: string;

    @Column({ name: 'guild', type: 'text', nullable: true })
    guild!: string | null;

    @Column({ name: 'content', type: 'text' })
    content!: string;

    @Column({ name: 'deleted', type: 'boolean' })
    deleted!: boolean;

    @Column({ name: 'createdAt', type: 'text', nullable: true })
    createdAt!: string;

    @Column({ name: 'embeds', type: 'json' })
    embeds!: object[];

    @Column({ name: 'reactions', type: 'json' })
    reactions!: { at: number; id: string; user: string }[];

    @Column({ name: 'edits', type: 'json' })
    edits!: { [type: string]: { at: number; from: any; to: any }[]};
}