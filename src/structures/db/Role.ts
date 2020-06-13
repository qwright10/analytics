import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity()
export class Role {
    @Generated()
    @Column({ name: 'uid' })
    uid!: number;

    @PrimaryColumn({ name: 'id', type: 'text' })
    id!: string;

    @Column({ name: 'name', type: 'text' })
    name!: string;

    @Column({ name: 'guild', type: 'text' })
    guild!: string;

    @Column({ name: 'color', type: 'int' })
    color!: number;

    @Column({ name: 'deleted', type: 'boolean' })
    deleted!: boolean;

    @Column({ name: 'managed', type: 'boolean' })
    managed!: boolean;

    @Column({ name: 'permissions', type: 'bigint' })
    permissions!: number;

    @Column({ name: 'edits', type: 'json' })
    edits!: { [type: string]: { at: number; from: any; to: any }[] };
}
