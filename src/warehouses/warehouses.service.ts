import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
    constructor(
        @InjectRepository(Warehouse)
        private readonly warehouseRepository: Repository<Warehouse>,
    ) { }

    async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
        const warehouse = this.warehouseRepository.create(createWarehouseDto);
        return await this.warehouseRepository.save(warehouse);
    }

    async findAll(): Promise<Warehouse[]> {
        return await this.warehouseRepository.find();
    }

    async findOne(BOD_CODIGO: string): Promise<Warehouse> {
        const warehouse = await this.warehouseRepository.findOne({ where: { BOD_CODIGO } });
        if (!warehouse) {
            throw new NotFoundException(`Warehouse with code ${BOD_CODIGO} not found`);
        }
        return warehouse;
    }

    async update(BOD_CODIGO: string, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse> {
        const warehouse = await this.findOne(BOD_CODIGO);
        this.warehouseRepository.merge(warehouse, updateWarehouseDto);
        return await this.warehouseRepository.save(warehouse);
    }

    async remove(BOD_CODIGO: string): Promise<void> {
        const result = await this.warehouseRepository.delete(BOD_CODIGO);
        if (result.affected === 0) {
            throw new NotFoundException(`Warehouse with code ${BOD_CODIGO} not found`);
        }
    }
}
