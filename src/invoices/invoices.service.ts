import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
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
}
