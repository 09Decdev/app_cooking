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
import {RecipeService} from '../service/recipe.service';
import {CreateRecipeDto} from '../dto/creat/create-recipe.dto';
import {AuthGuard} from '@nestjs/passport';
import {GetUser} from "../../../common/get-user.decorator";
import {StepDTO} from "../dto/creat/create-step.dto";
import {CreateRecipeIngredientDto} from "../dto/creat/create-ingredient.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {StepService} from "../service/step.service";
import {UpdateStepDto} from "../dto/update/update-step.dto";
import {DetailIngredientService} from "../service/detail-ingredient.service";
import {UpdateRecipeIngredientDto} from "../dto/update/update-ingredient.dto";
import {UpdateRecipeDto} from "../dto/update/update-recipe.dto";

@Controller('recipes')
export class RecipeController {
    constructor(
        private readonly recipeService: RecipeService,
        private readonly stepService: StepService,
        private readonly detailIngredientService: DetailIngredientService) {
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file'))
    @Post()
    create(@GetUser('id') userId: string, @Body() dto: CreateRecipeDto, @UploadedFile() file?: Express.Multer.File) {
        return this.recipeService.createRecipe(dto, userId, file);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':recipeId')
    @UseInterceptors(FileInterceptor('file'))
    update(@Param('recipeId') recipeId: string,
           @GetUser('id') userId: string,
           @Body() dto: UpdateRecipeDto,
           @UploadedFile() file?: Express.Multer.File) {
        return this.recipeService.updateRecipe(userId, recipeId, dto, file);
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file'))
    @Post("/steps/:recipeId")
    createStep(
        @Param('recipeId') recipeId: string,
        @GetUser('id') userId: string,
        @Body() dto: StepDTO,
        @UploadedFile() file?: Express.Multer.File) {
        return this.stepService.createSteps(dto, userId, recipeId, file)
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('steps/:stepId')
    @UseInterceptors(FileInterceptor('file'))
    updateStep(
        @Param('stepId') stepId: string,
        @GetUser('id') userId: string,
        @Body() dto: UpdateStepDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.stepService.updateStep(stepId, dto, userId, file);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('steps/:stepId')
    removeStep(@Param('stepId') stepId: string, @GetUser('id') userId: string) {
        return this.stepService.remove(stepId, userId);
    }

    @Get('steps/:recipeId')
    getAllStepByRecipe(@Param('recipeId') recipeId: string) {
        return this.stepService.getAll(recipeId);
    }

    @Get('steps/:stepId')
    getStep(@Param('stepId') stepId: string) {
        return this.stepService.findOne(stepId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('recipeIngredient')
    createRecipeIngredient(
        @GetUser('id') userId: string,
        @Body() dto: CreateRecipeIngredientDto
    ) {
        return this.detailIngredientService.createIngredient(dto, userId);
    }

    @Get('recipeIngredient/recipe/:recipeId')
    findAllIngredientsByRecipe(@Param('recipeId') recipeId: string) {
        return this.detailIngredientService.findAllByRecipe(recipeId);
    }

    @Get('recipeIngredient/:id')
    findOneIngredient(@Param('id') id: string) {
        return this.detailIngredientService.findOne(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('recipeIngredient/:id')
    updateIngredient(
        @Param('id') id: string,
        @GetUser('id') userId: string,
        @Body() dto: UpdateRecipeIngredientDto
    ) {
        return this.detailIngredientService.updateIngredient(id, dto, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('recipeIngredient/:id')
    removeIngredient(
        @Param('id') id: string,
        @GetUser('id') userId: string
    ) {
        return this.detailIngredientService.remove(id, userId);
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