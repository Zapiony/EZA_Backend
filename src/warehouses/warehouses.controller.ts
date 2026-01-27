import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.BODEGUERO)
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
