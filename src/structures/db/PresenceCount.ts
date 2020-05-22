import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PresenceCount {
    @PrimaryGeneratedColumn({ name: 'uid' })
    uid!: number;

    @Column({ name: 'c', type: 'bigint' })
    c!: number;
}