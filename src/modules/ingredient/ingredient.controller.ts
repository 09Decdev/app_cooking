import {Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards} from '@nestjs/common';
import {IngredientService} from './ingredient.service';
import {CreateIngredientDto} from './dto/create-ingredient.dto';
import {AuthGuard} from '@nestjs/passport';
import {UpdateIngredientDto} from "./dto/update-ingredient.dto";

@Controller('ingredients')
export class IngredientController {
    constructor(private readonly ingredientService: IngredientService) {
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() dto: CreateIngredientDto) {
        return this.ingredientService.create(dto);
    }

    @Get()
    findAll() {
        return this.ingredientService.findAll();
    }

    @Get('search')
    search(@Query('q') keyword: string) {
        return this.ingredientService.search(keyword);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ingredientService.findOne(id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateIngredientDto,
    ) {
        return this.ingredientService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ingredientService.remove(id);
    }
}