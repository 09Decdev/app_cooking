import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import {IngredientService} from './ingredient.service';
import {CreateIngredientDto} from './dto/create-ingredient.dto';
import {AuthGuard} from '@nestjs/passport';

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
}