import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum UserRole {
    GUEST = 'guest',
    CLIENT = 'client',
    EMPLOYEE = 'employee',
    ADMIN = 'admin',
}   

@Entity('users')

export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text', unique: true })
    username: string;

    @Column({ type: 'text' })
    name: string;

    @Column({ type: 'text', unique: true, nullable: true })
    email: string;

    @Column({ type: 'text', select: false })
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CLIENT,
    })
    role: UserRole;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Optional: Add method to hash password before saving
    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password) {
            // Only hash if simpler criteria met or distinct check logic used in service
            // Ideally hashing happens in Service, but this is a fail-safe or pattern preference.
            // For now, I'll comment this implementation detail out to avoid forcing it if they do it in service.
        }
    }
}    