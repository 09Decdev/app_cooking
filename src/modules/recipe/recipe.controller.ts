import { Body, Controller, Get, Param, Post, Delete, UseGuards } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { AuthGuard } from '@nestjs/passport';
import {GetUser} from "../../common/get-user.decorator";

@Controller('recipes')
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@GetUser('id') userId: string, @Body() dto: CreateRecipeDto) {
        return this.recipeService.create(dto, userId);
    }

    @Get()
    findAll() {
        return this.recipeService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.recipeService.findOne(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: string, @GetUser('id') userId: string) {
        return this.recipeService.remove(id, userId);
    }
}