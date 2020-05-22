import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity()
export class Emoji {
    @Generated()
    @Column({ name: 'uid' })
    uid!: number;

    @PrimaryColumn({ name: 'id', type: 'text' })
    id!: string;

    @Column({ name: 'createdAt', type: 'timestamp without time zone' })
    createdAt!: string;

    @Column({ name: 'deleted', type: 'boolean' })
    deleted!: boolean;

    @Column({ name: 'name', type: 'text' })
    name!: string;

    @Column({ name: 'url', type: 'text', nullable: true })
    url!: string | null;

    @Column({ name: 'edits', type: 'json' })
    edits!: { [type: string]: { at: number; from: any; to: any }[]};
}