import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
    constructor(private readonly dataSource: DataSource) { }

    async findAll() {
        // Using raw query to match the user's specific join and requirements
        const query = `
            SELECT o.ORD_CODIGO, o.PRV_RUC, p.PRV_RAZON_SOCIAL AS PRV_NOMBRE, o.ORD_FECHA_ENTREGA, o.ORD_ESTADO 
            FROM ORDEN_DE_COMPRA o
            JOIN PROVEEDOR p ON o.PRV_RUC = p.PRV_RUC
            ORDER BY o.ORD_CODIGO DESC
        `;
        return this.dataSource.query(query);
    }

    async create(createPurchaseOrderDto: CreatePurchaseOrderDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Get Next ID manually (as per DB logic requested)
            const resultId = await queryRunner.query('SELECT NVL(MAX(ORD_CODIGO), 0) + 1 AS NEXT_ID FROM ORDEN_DE_COMPRA');
            const newOrdCodigo = Number(resultId[0].NEXT_ID);

            // 2. Insert Master
            await queryRunner.query(
                `INSERT INTO ORDEN_DE_COMPRA (ORD_CODIGO, PRV_RUC, ORD_FECHA_ENTREGA, ORD_ESTADO) 
                 VALUES (:0, :1, TO_DATE(:2, 'YYYY-MM-DD'), 'EN ESPERA')`,
                [newOrdCodigo, createPurchaseOrderDto.PRV_RUC, createPurchaseOrderDto.ORD_FECHA_ENTREGA]
            );

            // 3. Insert Details
            if (createPurchaseOrderDto.detalles && createPurchaseOrderDto.detalles.length > 0) {
                for (const det of createPurchaseOrderDto.detalles) {
                    await queryRunner.query(
                        `INSERT INTO DETALLE_ORD_COMPRA (ORD_CODIGO, PRD_CODIGO, DET_ORD_COMPRA_CANTIDAD, DET_ORD_COMPRA_COSTO_UNITARIO)
                         VALUES (:0, :1, :2, :3)`,
                        [newOrdCodigo, det.PRD_CODIGO, det.DET_ORD_COMPRA_CANTIDAD, det.DET_ORD_COMPRA_COSTO_UNITARIO]
                    );
                }
            }

            await queryRunner.commitTransaction();
            return { success: true, ordCodigo: newOrdCodigo };

        } catch (err) {
            console.error('[PurchaseOrdersService] Error creating order:', err);
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Error creating purchase order');
        } finally {
            await queryRunner.release();
        }
    }

    async recibirMercaderia(ordCodigo: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            // Using query directly instead of procedure call might be safer depending on driver support, 
            // but queryRunner.query with BEGIN...END block works for PL/SQL
            await queryRunner.query(`
                BEGIN
                    PR_RECEPCION_MERCADERIA(:0);
                END;
            `, [ordCodigo]);

            return { success: true, message: 'Mercadería recibida correctamente' };
        } catch (err) {
            console.error('[PurchaseOrdersService] Error executing PR_RECEPCION_MERCADERIA:', err);
            throw new InternalServerErrorException(err.message || 'Error receiving merchandise');
        } finally {
            await queryRunner.release();
        }
    }

    async remove(ordCodigo: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Delete details first
            await queryRunner.query('DELETE FROM DETALLE_ORD_COMPRA WHERE ORD_CODIGO = :0', [ordCodigo]);
            // Delete master
            await queryRunner.query('DELETE FROM ORDEN_DE_COMPRA WHERE ORD_CODIGO = :0', [ordCodigo]);

            await queryRunner.commitTransaction();
            return { success: true };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Error deleting purchase order');
        } finally {
            await queryRunner.release();
        }
    }
}
