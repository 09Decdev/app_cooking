import {Body, Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {RecipeService} from './recipe.service';
import {CreateRecipeDto} from './dto/create-recipe.dto';
import {AuthGuard} from '@nestjs/passport';
import {GetUser} from "../../common/get-user.decorator";
import {StepDTO} from "./dto/create-step.dto";
import {CreateRecipeIngredientDto} from "./dto/create-ingredient.dto";
import {FileInterceptor} from "@nestjs/platform-express";

@Controller('recipes')
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) {
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file'))
    @Post()
    create(@GetUser('id') userId: string, @Body() dto: CreateRecipeDto, @UploadedFile() file?: Express.Multer.File) {
        return this.recipeService.createRecipe(dto, userId, file);
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file'))
    @Post("/steps/:recipeId")
    createStep(
        @Param('recipeId') recipeId: string,
        @GetUser('id') userId: string,
        @Body() dto: StepDTO,
        @UploadedFile() file?: Express.Multer.File) {
        return this.recipeService.createSteps(dto, userId, recipeId, file)
    }

    @UseGuards(AuthGuard('jwt'))
    @Post("/recipeIngredient")
    createRecipeIngredient(
        @GetUser('id') userId: string,
        @Body() dto: CreateRecipeIngredientDto) {
        return this.recipeService.createIngredient(dto, userId)
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