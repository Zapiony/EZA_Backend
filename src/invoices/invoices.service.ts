import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Client } from '../clients/entities/client.entity';
import PDFDocument from 'pdfkit';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(Client)
        private readonly clientRepository: Repository<Client>,
    ) { }

    findAll() {
        return this.invoiceRepository.find();
    }

    async remove(id: number) {
        const result = await this.invoiceRepository.delete({ FAC_CODIGO: id });
        if (result.affected === 0) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
        return { message: 'Factura eliminada correctamente' };
    }

    async generatePdf(invoiceId: number): Promise<Buffer> {
        const invoice = await this.invoiceRepository.findOne({ where: { FAC_CODIGO: invoiceId } });
        if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);

        const client = await this.clientRepository.findOne({ where: { CLI_CEDULA_RUC: invoice.CLI_CEDULA_RUC } });

        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));

        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            doc.on('error', reject);

            // --- HEADER ---
            doc.font('Helvetica-Bold').fontSize(20).text('EZA', { align: 'center' });
            doc.fontSize(10).text('RUC: 1790012345001', { align: 'center' });
            doc.text('Dirección: Av. Amazonas y Naciones Unidas', { align: 'center' });
            doc.moveDown();

            // --- INVOICE INFO ---
            doc.font('Helvetica-Bold').fontSize(14).text('FACTURA', { align: 'right' });
            doc.fontSize(10).text(`No. ${String(invoice.FAC_CODIGO).padStart(9, '0')}`, { align: 'right' });
            doc.text(`Fecha: ${invoice.FAC_FECHA instanceof Date ? invoice.FAC_FECHA.toISOString().split('T')[0] : invoice.FAC_FECHA}`, { align: 'right' });
            doc.moveDown();

            // --- CLIENT INFO ---
            doc.rect(50, doc.y, 500, 70).stroke();
            const startY = doc.y + 10;
            doc.text('DATOS DEL CLIENTE:', 60, startY);
            doc.font('Helvetica').text(`Razón Social: ${client?.CLI_NOMBRE || 'Consumidor Final'}`, 60, startY + 15);
            doc.text(`RUC/C.I.: ${invoice.CLI_CEDULA_RUC}`, 60, startY + 30);
            doc.text(`Teléfono: ${client?.CLI_TELEFONO || 'N/A'}`, 300, startY + 30);
            doc.text(`Dirección: ${'Quito, Ecuador'}`, 60, startY + 45); // Placeholder
            doc.moveDown(4);

            // --- TABLE HEADER ---
            let tableTop = doc.y;
            doc.font('Helvetica-Bold');
            doc.text('Descripción', 60, tableTop);
            doc.text('Precio Unit.', 350, tableTop, { width: 90, align: 'right' });
            doc.text('Total', 440, tableTop, { width: 90, align: 'right' });

            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            // --- ITEMS ---
            doc.font('Helvetica');
            tableTop += 25;
            // Placeholder items until we have Detail entity
            doc.text('Compra de Productos E-Commerce', 60, tableTop);
            doc.text(Number(invoice.FAC_SUBTOTAL).toFixed(2), 350, tableTop, { width: 90, align: 'right' });
            doc.text(Number(invoice.FAC_SUBTOTAL).toFixed(2), 440, tableTop, { width: 90, align: 'right' });

            // --- TOTALS ---
            const totalY = tableTop + 40;
            doc.moveTo(350, totalY).lineTo(550, totalY).stroke();

            doc.font('Helvetica-Bold');
            doc.text('Subtotal:', 350, totalY + 10, { width: 90, align: 'right' });
            doc.text(Number(invoice.FAC_SUBTOTAL).toFixed(2), 440, totalY + 10, { width: 90, align: 'right' });

            doc.text('IVA (15%):', 350, totalY + 25, { width: 90, align: 'right' });
            doc.text(Number(invoice.FAC_IVA).toFixed(2), 440, totalY + 25, { width: 90, align: 'right' });

            doc.fillColor('blue').fontSize(12).text('TOTAL A PAGAR:', 350, totalY + 45, { width: 90, align: 'right' });
            doc.text(`$ ${Number(invoice.FAC_MONTO_TOTAL).toFixed(2)}`, 440, totalY + 45, { width: 90, align: 'right' });

            doc.end();
        });
    }
    async getMonthlySales() {
        // Oracle specific query for monthly aggregation
        const results = await this.invoiceRepository.query(`
            SELECT TO_CHAR(FAC_FECHA, 'YYYY-MM') AS MES, SUM(FAC_MONTO_TOTAL) AS TOTAL 
            FROM FACTURA 
            GROUP BY TO_CHAR(FAC_FECHA, 'YYYY-MM') 
            ORDER BY MES ASC
        `);
        return results;
    }
}
