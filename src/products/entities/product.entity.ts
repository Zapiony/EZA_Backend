import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('PRODUCTO')
export class Product {
    @PrimaryColumn({ name: 'PRD_CODIGO' })
    PRD_CODIGO: string;

    @Column({ name: 'CAT_CODIGO' })
    CAT_CODIGO: string; // Changed to string to match CATEGORIA table (VARCHAR2)

    @Column({ name: 'PRD_DESCRIPCION' })
    PRD_DESCRIPCION: string;

    @Column({ name: 'PRD_PRECIO', type: 'float' }) // Using float/number
    PRD_PRECIO: number;

    @Column({ name: 'PRD_COSTO_ADQUISICION', type: 'float' })
    PRD_COSTO_ADQUISICION: number;
}
