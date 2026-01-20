import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('DETALLE_CARRITO')
export class ShoppingCartDetail {
    @PrimaryColumn({ name: 'CAR_CODIGO' })
    CAR_CODIGO: number;

    @PrimaryColumn({ name: 'PRD_CODIGO', length: 8 }) // Length 8 based on image check but usually matches Product logic
    PRD_CODIGO: string;

    @Column({ name: 'DET_CAR_CANTIDAD' })
    DET_CAR_CANTIDAD: number;
}
