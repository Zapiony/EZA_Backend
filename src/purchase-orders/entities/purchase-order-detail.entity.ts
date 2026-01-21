import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('DETALLE_ORD_COMPRA')
export class PurchaseOrderDetail {
    @PrimaryColumn({ name: 'ORD_CODIGO' })
    ORD_CODIGO: number;

    @PrimaryColumn({ name: 'PRD_CODIGO', length: 10 })
    PRD_CODIGO: string;

    @Column({ name: 'DET_ORD_COMPRA_CANTIDAD' })
    DET_ORD_COMPRA_CANTIDAD: number;

    @Column({ name: 'DET_ORD_COMPRA_COSTO_UNITARIO', type: 'float' })
    DET_ORD_COMPRA_COSTO_UNITARIO: number;
}
