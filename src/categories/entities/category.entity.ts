import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('CATEGORIA')
export class Category {
    @PrimaryColumn({ name: 'CAT_CODIGO', length: 5 })
    CAT_CODIGO: string;

    @Column({ name: 'CAT_NOMBRE', length: 60 })
    CAT_NOMBRE: string;

    @Column({ name: 'CAT_DESCRIPCION', length: 60 })
    CAT_DESCRIPCION: string;
}
