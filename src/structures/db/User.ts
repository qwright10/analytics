import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
    @Generated()
    @Column({ name: 'uid' })
    uid!: number;

    @PrimaryColumn({ name: 'id', type: 'text' })
    id!: string;

    @Column({ name: 'tag', type: 'text' })
    tag!: string;

    @Column({ name: 'avatarURL', type: 'text', nullable: true })
    avatar!: string | null;

    @Column({ name: 'guilds', type: 'json' })
    guilds!: string[];

    @Column({ name: 'joins', type: 'json' })
    joins!: { at: number; id: string }[];

    @Column({ name: 'leaves', type: 'json' })
    leaves!: { at: number; id: string }[];

    @Column({ name: 'edits', type: 'json' })
    edits!: { [type: string]: { at: number; from: any; to: any }[]};
}