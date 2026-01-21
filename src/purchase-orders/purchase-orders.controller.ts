import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete, Patch } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

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
