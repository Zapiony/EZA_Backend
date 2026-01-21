import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('BODEGA')
export class Warehouse {
    @PrimaryColumn({ name: 'BOD_CODIGO', length: 6 })
    BOD_CODIGO: string;

    @Column({ name: 'BOD_DESCRIPCION', length: 60 })
    BOD_DESCRIPCION: string;

    @Column({ name: 'BOD_DIRECCION', length: 60 })
    BOD_DIRECCION: string;

    @Column({ name: 'BOD_NOMBRE_ENCARGADO', length: 60 })
    BOD_NOMBRE_ENCARGADO: string;

    @Column({ name: 'BOD_TELEFONO_ENCARGADO', length: 10 })
    BOD_TELEFONO_ENCARGADO: string;
}
