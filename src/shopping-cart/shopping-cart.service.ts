import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ShoppingCart } from './entities/shopping-cart.entity';
import { ShoppingCartDetail } from './entities/shopping-cart-detail.entity';

import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class ShoppingCartService {
    constructor(
        @InjectDataSource('PUBLIC_DB') private readonly dataSource: DataSource,
        @InjectDataSource() private readonly privateDataSource: DataSource,
    ) { }

    // Creates a new cart for a user (called on registration)
    async createCartForUser(cedula: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Get Next ID
            const resultId = await queryRunner.query('SELECT NVL(MAX(CAR_CODIGO), 0) + 1 AS NEXT_ID FROM CARRITO_DE_COMPRA');
            const newId = Number(resultId[0].NEXT_ID);

            // Insert Cart
            await queryRunner.query(
                `INSERT INTO CARRITO_DE_COMPRA (CAR_CODIGO, CLI_CEDULA_RUC, CAR_FECHA_ULT_ACT) 
                 VALUES (:0, :1, SYSDATE)`,
                [newId, cedula]
            );

            await queryRunner.commitTransaction();
            return newId;
        } catch (err) {
            console.error('[ShoppingCart] Error creating cart:', err);
            await queryRunner.rollbackTransaction();
            // Don't throw here to avoid blocking registration if cart creation fails, 
            // or throw if it's critical. User said "point is critical".
            // However, usually we log it. I'll rethrow for safety.
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async getCartByUserId(cedula: string) {
        const cart = await this.dataSource.query(
            `SELECT CAR_CODIGO FROM CARRITO_DE_COMPRA WHERE CLI_CEDULA_RUC = :0`,
            [cedula]
        );

        if (!cart || cart.length === 0) {
            throw new NotFoundException(`No existe un carrito activo para el usuario ${cedula}`);
        }

        const carCodigo = cart[0].CAR_CODIGO;

        const details = await this.dataSource.query(
            `SELECT d.PRD_CODIGO, d.DET_CAR_CANTIDAD, p.PRD_DESCRIPCION, p.PRD_PRECIO
             FROM DETALLE_CARRITO d
             LEFT JOIN PRODUCTO p ON d.PRD_CODIGO = p.PRD_CODIGO
             WHERE d.CAR_CODIGO = :0`,
            [carCodigo]
        );

        return {
            ...cart[0],
            items: details
        };
    }

    async addItem(cedula: string, productCode: string, quantity: number) {
        const cart = await this.getCartByUserId(cedula);
        if (!cart) {
            throw new NotFoundException('No shopping cart found for this user');
        }

        const carCodigo = cart.CAR_CODIGO;

        // Check if item exists to update or insert
        const existingItem = await this.dataSource.query(
            `SELECT * FROM DETALLE_CARRITO WHERE CAR_CODIGO = :0 AND PRD_CODIGO = :1`,
            [carCodigo, productCode]
        );

        if (existingItem && existingItem.length > 0) {
            // Update
            await this.dataSource.query(
                `UPDATE DETALLE_CARRITO SET DET_CAR_CANTIDAD = DET_CAR_CANTIDAD + :0 
                 WHERE CAR_CODIGO = :1 AND PRD_CODIGO = :2`,
                [quantity, carCodigo, productCode]
            );
        } else {
            // Insert
            await this.dataSource.query(
                `INSERT INTO DETALLE_CARRITO (CAR_CODIGO, PRD_CODIGO, DET_CAR_CANTIDAD)
                 VALUES (:0, :1, :2)`,
                [carCodigo, productCode, quantity]
            );
        }

        // Update timestamp
        await this.dataSource.query(
            `UPDATE CARRITO_DE_COMPRA SET CAR_FECHA_ULT_ACT = SYSDATE WHERE CAR_CODIGO = :0`,
            [carCodigo]
        );

        return this.getCartByUserId(cedula);
    }

    async removeItem(cedula: string, productCode: string) {
        const cart = await this.getCartByUserId(cedula);
        if (!cart) return;

        await this.dataSource.query(
            `DELETE FROM DETALLE_CARRITO WHERE CAR_CODIGO = :0 AND PRD_CODIGO = :1`,
            [cart.CAR_CODIGO, productCode]
        );

        return this.getCartByUserId(cedula);
    }

    // Checkout: Execute Procedure
    async checkout(cedula: string, cedulaFactura: string, formaPago: string) {
        const cart = await this.getCartByUserId(cedula);
        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        const carCodigo = cart.CAR_CODIGO;

        const queryRunner = this.privateDataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            await queryRunner.query(
                `BEGIN
                    PA_REGISTRAR_FACTURA(:0, :1, :2);
                 END;`,
                [carCodigo, cedulaFactura, formaPago]
            );
            return { success: true, message: 'Factura generada y carrito procesado' };
        } catch (err) {
            console.error('[ShoppingCart] Error executing PA_REGISTRAR_FACTURA:', err);
            throw new InternalServerErrorException(err.message || 'Error processing checkout');
        } finally {
            await queryRunner.release();
        }
    }
}
