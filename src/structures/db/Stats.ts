import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity()
export class Stats {
    @Generated()
    @Column({ name: 'uid' })
    uid!: number;

    @PrimaryColumn({ name: 'time', type: 'timestamp without time zone' })
    time!: string;

    @Column({ name: 'guilds', type: 'int' })
    guilds!: number;

    @Column({ name: 'members', type: 'int' })
    members!: number;

    @Column({ name: 'cpu', type: 'json', nullable: true })
    cpu!: NodeJS.CpuUsage;

    @Column({ name: 'memory', type: 'json', nullable: true })
    memory!: NodeJS.MemoryUsage;
}