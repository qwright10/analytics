import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Presence {
    @PrimaryGeneratedColumn({ name: 'uid' })
    uid!: any;

    @Column({ name: 'id', type: 'text' })
    id!: string;

    @Column({ name: 'at', type: 'timestamp without time zone' })
    at!: string;

    @Column({ name: 'presence', type: 'json', nullable: true })
    presence!: object | null;
}
