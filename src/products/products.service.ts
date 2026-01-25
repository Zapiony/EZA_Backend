import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product, 'PUBLIC_DB')
        private readonly productRepository: Repository<Product>,
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const product = this.productRepository.create(createProductDto);
        return await this.productRepository.save(product);
    }

    async findAll(): Promise<Product[]> {
        return await this.productRepository.find();
    }

    async findOne(PRD_CODIGO: string): Promise<Product> {
        const product = await this.productRepository.findOne({ where: { PRD_CODIGO } });
        if (!product) {
            throw new NotFoundException(`Product with code ${PRD_CODIGO} not found`);
        }
        return product;
    }

    async update(PRD_CODIGO: string, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(PRD_CODIGO);
        this.productRepository.merge(product, updateProductDto);
        return await this.productRepository.save(product);
    }

    async remove(PRD_CODIGO: string): Promise<void> {
        const result = await this.productRepository.delete(PRD_CODIGO);
        if (result.affected === 0) {
            throw new NotFoundException(`Product with code ${PRD_CODIGO} not found`);
        }
    }
}
