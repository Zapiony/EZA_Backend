import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { AddToCartDto, CheckoutDto } from './dto/shopping-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CLIENT)
@Controller('cart')
export class ShoppingCartController {
    constructor(private readonly cartService: ShoppingCartService) { }

    @Get(':identification')
    getCart(@Param('identification') identification: string) {
        return this.cartService.getCartByUserId(identification);
    }

    @Post(':identification/add')
    addItem(@Param('identification') identification: string, @Body() dto: AddToCartDto) {
        return this.cartService.addItem(identification, dto.PRD_CODIGO, dto.cantidad);
    }

    @Delete(':identification/remove/:productId')
    removeItem(@Param('identification') identification: string, @Param('productId') productId: string) {
        return this.cartService.removeItem(identification, productId);
    }

    @Post(':identification/checkout')
    checkout(@Param('identification') identification: string, @Body() dto: CheckoutDto) {
        return this.cartService.checkout(identification, dto.cedulaFactura, dto.formaPago);
    }
}
