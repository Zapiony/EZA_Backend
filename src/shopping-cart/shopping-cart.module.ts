import { Module, forwardRef } from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { ShoppingCartController } from './shopping-cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingCart } from './entities/shopping-cart.entity';
import { ShoppingCartDetail } from './entities/shopping-cart-detail.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ShoppingCart, ShoppingCartDetail]),
        forwardRef(() => AuthModule) // Use forwardRef if circular dependency issues arise, or just normal import
    ],
    controllers: [ShoppingCartController],
    providers: [ShoppingCartService],
    exports: [ShoppingCartService],
})
export class ShoppingCartModule { }
