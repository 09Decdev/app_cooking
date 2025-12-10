import {Body, Controller, Delete, Get, Param, Post, Put, UseGuards} from '@nestjs/common';
import {CategoryService} from './category.service';
import {CreateCategoryDto} from './dto/create-category.dto';
import {UpdateCategoryDto} from "./dto/update-category.dto";
import {GetUser} from "../../common/get-user.decorator";
import {AuthGuard} from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {
    }

    @Post()
    create(@GetUser('id') userId: string, @Body() dto: CreateCategoryDto) {
        return this.categoryService.create(dto, userId);
    }

    @Put(':id')
    update(@Param('id') id: string, @GetUser('id') userId: string, @Body() dto: UpdateCategoryDto) {
        return this.categoryService.update(id, dto, userId);
    }

    @Get()
    findAll() {
        return this.categoryService.findAll();
    }

    @Delete(':id')
    remove(@Param('id') id: string,@GetUser('id') userId: string) {
        return this.categoryService.remove(id,userId);
    }
}