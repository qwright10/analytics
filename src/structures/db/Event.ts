import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Event {
    @PrimaryGeneratedColumn({ name: 'uid' })
    uid!: number;

    @Column({ name: 'type', type: 'text' })
    type!: string;

    @Column({ name: 'data', type: 'json' })
    data!: any;

    @Column({ name: 'count', type: 'bigint', nullable: true })
    count!: number | null;
}