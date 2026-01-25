import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Note: This entity maps to the USUARIO table as requested.
// The structure follows the image provided: USU_ID, CLI_CEDULA_RUC, USU_NOMBRE, USU_CONTRASENA

export enum UserRole {
    CLIENT = 'client',
    ADMIN = 'admin',
}

@Entity('USUARIO')
export class User {
    @Column({ name: 'USU_ID', primary: true, generated: 'identity' })
    id: string;

    @Column({ name: 'CLI_CEDULA_RUC', unique: true })
    cedula: string; // This acts as the username/identifier

    @Column({ name: 'USU_NOMBRE' })
    name: string;

    @Column({ name: 'USU_CONTRASENA', select: false })
    password: string;

    // These fields are not in the image but might be needed for the app logic.
    // If they are not in the DB, we should mark them as virtual or remove them if not needed.
    // For now, I will keep 'email' as it is used in DTOs, but maybe map it to CLI_CEDULA_RUC or remove it?
    // The LoginDto uses 'email'. I should probably support email OR cedula.
    // Use CLI_CEDULA_RUC as the login identifier.

    // I'll add 'email' purely to satisfy TS interfaces if needed, or better, remove it and update everything.
    // Let's assume there is NO email in USUARIO table based on the image.

    // Default Role for anyone in this table is CLIENT.
    // Virtual Role property (not in DB)
    role: UserRole = UserRole.CLIENT;

    // Helper for active status, default true
    isActive: boolean = true;
}