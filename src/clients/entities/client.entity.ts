import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('CLIENTE')
export class Client {
    @PrimaryColumn({ name: 'CLI_CEDULA_RUC', length: 13 })
    CLI_CEDULA_RUC: string;

    @Column({ name: 'CLI_NOMBRE', length: 60 })
    CLI_NOMBRE: string;

    @Column({ name: 'CLI_TELEFONO', length: 10 })
    CLI_TELEFONO: string;

    @Column({ name: 'CLI_CORREO', length: 60 })
    CLI_CORREO: string;
}
