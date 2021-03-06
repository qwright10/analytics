import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity()
export class Guild {
    @Generated()
    @Column({ name: 'uid' })
    uid!: number;

    @PrimaryColumn({ name: 'id', type: 'text' })
    id!: string;

    @Column({ name: 'owner', type: 'text' })
    owner!: string;

    @Column({ name: 'name', type: 'text' })
    name!: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description!: string | null;

    @Column({ name: 'createdAt', type: 'timestamp without time zone' })
    createdAt!: string;

    @Column({ name: 'deleted', type: 'boolean', default: false })
    deleted!: boolean;

    @Column({ name: 'joins', type: 'json', default: [] })
    joins!: { at: number; id: string }[];

    @Column({ name: 'leaves', type: 'json', default: [] })
    leaves!: { at: number; id: string }[];

    @Column({ name: 'bans', type: 'json' })
    bans!: string[];

    @Column({ name: 'messages', type: 'int', default: 0 })
    messages!: number;

    @Column({ name: 'edits', type: 'json' })
    edits!: { [type: string]: { at: number; from: any; to: any }[] };
}
