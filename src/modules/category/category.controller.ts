import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {CategoryService} from './category.service';
import {CreateCategoryDto} from './dto/create-category.dto';
import {UpdateCategoryDto} from "./dto/update-category.dto";
import {GetUser} from "../../common/get-user.decorator";
import {AuthGuard} from "@nestjs/passport";
import {FileInterceptor} from "@nestjs/platform-express";

@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    create(@GetUser('id') userId: string, @Body() dto: CreateCategoryDto, @UploadedFile() file?: Express.Multer.File) {
        return this.categoryService.create(dto, userId, file);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('file'))
    update(@Param('id') id: string, @GetUser('id') userId: string, @Body() dto: UpdateCategoryDto, @UploadedFile() file?: Express.Multer.File) {
        return this.categoryService.update(id, dto, userId, file);
    }

    @Get()
    findAll() {
        return this.categoryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoryService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @GetUser('id') userId: string) {
        return this.categoryService.remove(id, userId);
    }
}