import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Raw {
    @PrimaryGeneratedColumn({ name: 'uid' })
    uid!: number;

    @Column({ name: 'time', type: 'timestamp without time zone' })
    time!: string;

    @Column({ name: 'op', type: 'smallint', nullable: true })
    op!: number | null;

    @Column({ name: 't', type: 'text', nullable: true })
    t!: string | null;

    @Column({ name: 'count', type: 'int', default: 1 })
    count!: number;
}