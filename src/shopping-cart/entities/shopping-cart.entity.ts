import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('CARRITO_DE_COMPRA')
export class ShoppingCart {
    @PrimaryColumn({ name: 'CAR_CODIGO' })
    CAR_CODIGO: number;

    @Column({ name: 'CLI_CEDULA_RUC', length: 13 })
    CLI_CEDULA_RUC: string;

    @Column({ name: 'CAR_FECHA_ULT_ACT' })
    CAR_FECHA_ULT_ACT: Date;
}
