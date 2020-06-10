import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Stats {
    @PrimaryColumn({ name: 'timestamp', type: 'timestamp without time zone' })
    timestamp!: string;

    @Column({ name: 'shard', type: 'smallint' })
    shard!: number;

    @Column({ name: 'type', type: 'text' })
    type!: 'command' | 'client';

    @Column({ name: 'data', type: 'json' })
    data!: any;
}