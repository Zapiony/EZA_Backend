import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    @Get(':code')
    findOne(@Param('code') code: string) {
        return this.categoriesService.findOne(code);
    }

    @Patch(':code')
    update(@Param('code') code: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoriesService.update(code, updateCategoryDto);
    }

    @Delete(':code')
    remove(@Param('code') code: string) {
        return this.categoriesService.remove(code);
    }
}
