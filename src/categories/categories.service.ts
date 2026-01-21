import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const category = this.categoryRepository.create(createCategoryDto);
        return await this.categoryRepository.save(category);
    }

    async findAll(): Promise<Category[]> {
        return await this.categoryRepository.find();
    }

    async findOne(CAT_CODIGO: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({ where: { CAT_CODIGO } });
        if (!category) {
            throw new NotFoundException(`Category with code ${CAT_CODIGO} not found`);
        }
        return category;
    }

    async update(CAT_CODIGO: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(CAT_CODIGO);
        this.categoryRepository.merge(category, updateCategoryDto);
        return await this.categoryRepository.save(category);
    }

    async remove(CAT_CODIGO: string): Promise<void> {
        const result = await this.categoryRepository.delete(CAT_CODIGO);
        if (result.affected === 0) {
            throw new NotFoundException(`Category with code ${CAT_CODIGO} not found`);
        }
    }
}
