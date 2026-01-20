import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
    constructor(
        @InjectRepository(Supplier)
        private readonly supplierRepository: Repository<Supplier>,
    ) { }

    async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
        const supplier = this.supplierRepository.create(createSupplierDto);
        return await this.supplierRepository.save(supplier);
    }

    async findAll(): Promise<Supplier[]> {
        return await this.supplierRepository.find();
    }

    async findOne(PRV_RUC: string): Promise<Supplier> {
        const supplier = await this.supplierRepository.findOne({ where: { PRV_RUC } });
        if (!supplier) {
            throw new NotFoundException(`Supplier with RUC ${PRV_RUC} not found`);
        }
        return supplier;
    }

    async update(PRV_RUC: string, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
        const supplier = await this.findOne(PRV_RUC);
        this.supplierRepository.merge(supplier, updateSupplierDto);
        return await this.supplierRepository.save(supplier);
    }

    async remove(PRV_RUC: string): Promise<void> {
        const result = await this.supplierRepository.delete(PRV_RUC);
        if (result.affected === 0) {
            throw new NotFoundException(`Supplier with RUC ${PRV_RUC} not found`);
        }
    }
}
