import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('ORDEN_DE_COMPRA')
export class PurchaseOrder {
    @PrimaryColumn({ name: 'ORD_CODIGO' })
    ORD_CODIGO: number;

    @Column({ name: 'PRV_RUC', length: 13 })
    PRV_RUC: string;

    @Column({ name: 'ORD_FECHA_ENTREGA' })
    ORD_FECHA_ENTREGA: Date;

    @Column({ name: 'ORD_ESTADO', length: 20 })
    ORD_ESTADO: string;
}
