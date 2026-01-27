import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product, 'PUBLIC_DB')
        private readonly productRepository: Repository<Product>,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const product = this.productRepository.create(createProductDto);
        return await this.productRepository.save(product);
    }

    async findAll(): Promise<any[]> {
        const products = await this.productRepository.find();

        try {
            const details = await this.dataSource.query(`
                SELECT PRD_CODIGO, DET_BOD_CANTIDAD 
                FROM DETALLE_BODEGA 
                WHERE BOD_CODIGO = 'BOG-01'
            `);

            return products.map(product => {
                const detail = details.find(d => d.PRD_CODIGO === product.PRD_CODIGO);
                return {
                    ...product,
                    DET_BOD_CANTIDAD: detail ? detail.DET_BOD_CANTIDAD : 0
                };
            });
        } catch (error) {
            console.error('Error fetching stock details:', error);
            return products.map(p => ({ ...p, DET_BOD_CANTIDAD: 0 }));
        }
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
