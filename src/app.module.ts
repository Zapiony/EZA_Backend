import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { ClientsModule } from './clients/clients.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { ShoppingCartModule } from './shopping-cart/shopping-cart.module';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Category } from './categories/entities/category.entity';
import { Warehouse } from './warehouses/entities/warehouse.entity';
import { Client } from './clients/entities/client.entity';
import { Supplier } from './suppliers/entities/supplier.entity';
import { PurchaseOrder } from './purchase-orders/entities/purchase-order.entity';
import { PurchaseOrderDetail } from './purchase-orders/entities/purchase-order-detail.entity';
import { ShoppingCart } from './shopping-cart/entities/shopping-cart.entity';
import { ShoppingCartDetail } from './shopping-cart/entities/shopping-cart-detail.entity';
import { InvoicesModule } from './invoices/invoices.module';
import { Invoice } from './invoices/entities/invoice.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'oracle',
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        connectString: configService.get<string>('DB_CONNECT_STRING'),
        entities: [User, Product, Category, Warehouse, Client, Supplier, PurchaseOrder, PurchaseOrderDetail, ShoppingCart, ShoppingCartDetail, Invoice],
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    WarehousesModule,
    ClientsModule,
    SuppliersModule,
    PurchaseOrdersModule,
    ShoppingCartModule,
    InvoicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
