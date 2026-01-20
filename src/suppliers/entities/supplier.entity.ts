import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('PROVEEDOR')
export class Supplier {
    @PrimaryColumn({ name: 'PRV_RUC', length: 13 })
    PRV_RUC: string;



    @Column({ name: 'PRV_DIRECCION', length: 60 })
    PRV_DIRECCION: string;

    @Column({ name: 'PRV_TELEFONO', length: 10 })
    PRV_TELEFONO: string;

    @Column({ name: 'PRV_RAZON_SOCIAL', length: 60, nullable: true })
    PRV_RAZON_SOCIAL: string;

    @Column({ name: 'PRV_CORREO', length: 60, nullable: true })
    PRV_CORREO: string;
}
