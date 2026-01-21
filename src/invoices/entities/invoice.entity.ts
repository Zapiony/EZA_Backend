import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('FACTURA')
export class Invoice {
    @PrimaryColumn({ name: 'FAC_CODIGO' })
    FAC_CODIGO: number;

    @Column({ name: 'CLI_CEDULA_RUC', type: 'varchar2', length: 13 })
    CLI_CEDULA_RUC: string;

    @Column({ name: 'FAC_FECHA', type: 'date' })
    FAC_FECHA: Date;

    @Column({ name: 'FAC_SUBTOTAL', type: 'number', precision: 10, scale: 2 })
    FAC_SUBTOTAL: number;

    @Column({ name: 'FAC_IVA', type: 'number', precision: 10, scale: 2 })
    FAC_IVA: number;

    @Column({ name: 'FAC_MONTO_TOTAL', type: 'number', precision: 10, scale: 2 })
    FAC_MONTO_TOTAL: number;

    @Column({ name: 'FAC_METODO_PAGO', type: 'varchar2', length: 20 })
    FAC_METODO_PAGO: string;
}
