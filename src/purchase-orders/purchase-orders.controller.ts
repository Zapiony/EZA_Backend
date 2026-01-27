import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete, Patch, UseGuards } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COMPRAS)
@Controller('purchase-orders')
export class PurchaseOrdersController {
    constructor(private readonly purchaseOrdersService: PurchaseOrdersService) { }

    @Get()
    findAll() {
        return this.purchaseOrdersService.findAll();
    }

    @Post()
    create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto) {
        return this.purchaseOrdersService.create(createPurchaseOrderDto);
    }

    @Patch(':id/receive')
    recibirMercaderia(@Param('id', ParseIntPipe) id: number) {
        return this.purchaseOrdersService.recibirMercaderia(id);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.purchaseOrdersService.remove(id);
    }
}
