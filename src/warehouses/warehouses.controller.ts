import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Controller('warehouses')
export class WarehousesController {
    constructor(private readonly warehousesService: WarehousesService) { }

    @Post()
    create(@Body() createWarehouseDto: CreateWarehouseDto) {
        return this.warehousesService.create(createWarehouseDto);
    }

    @Get()
    findAll() {
        return this.warehousesService.findAll();
    }

    @Get(':code')
    findOne(@Param('code') code: string) {
        return this.warehousesService.findOne(code);
    }

    @Patch(':code')
    update(@Param('code') code: string, @Body() updateWarehouseDto: UpdateWarehouseDto) {
        return this.warehousesService.update(code, updateWarehouseDto);
    }

    @Delete(':code')
    remove(@Param('code') code: string) {
        return this.warehousesService.remove(code);
    }
}
