import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    @Roles(UserRole.ADMIN)
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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch(':code')
    @Roles(UserRole.ADMIN)
    update(@Param('code') code: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoriesService.update(code, updateCategoryDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(':code')
    @Roles(UserRole.ADMIN)
    remove(@Param('code') code: string) {
        return this.categoriesService.remove(code);
    }
}
