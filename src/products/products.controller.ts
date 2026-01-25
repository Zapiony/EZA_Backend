import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @Get(':code')
    findOne(@Param('code') code: string) {
        return this.productsService.findOne(code);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch(':code')
    @Roles(UserRole.ADMIN)
    update(@Param('code') code: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(code, updateProductDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(':code')
    @Roles(UserRole.ADMIN)
    remove(@Param('code') code: string) {
        return this.productsService.remove(code);
    }
}
