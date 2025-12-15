import {PrismaService} from "../../../prisma.service";
import {CreateRecipeIngredientDto} from "../dto/creat/create-ingredient.dto";
import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {UpdateRecipeIngredientDto} from "../dto/update/update-ingredient.dto";

@Injectable()
export class DetailIngredientService {
    constructor(private readonly prisma: PrismaService) {
    }

    async createIngredient(dto: CreateRecipeIngredientDto, userId: string) {
        const recipe = await this.prisma.recipe.findUnique({
            where: {id: dto.recipeId},
        });
        if (!recipe) {
            throw new NotFoundException(`Recipe with id ${dto.recipeId} not found`);
        }

        const ingredient = await this.prisma.ingredient.findUnique({
            where: {id: dto.ingredientId},
        })
        if (!ingredient) {
            throw new NotFoundException(`Ingredient with id ${dto.ingredientId} not found`);
        }
        if (recipe.authorId != userId) {
            throw new ForbiddenException("You don't have permission to use this action!");
        }

        return this.prisma.recipeIngredient.create({
            data: {
                recipeId: recipe.id,
                ingredientId: ingredient.id,
                amount: dto.amount
            },
            include: {ingredient: true}
        });
    }

    async updateIngredient(id: string, dto: UpdateRecipeIngredientDto, userId: string) {
        const recipeIngredient = await this.prisma.recipeIngredient.findUnique({
            where: {id},
            include: {recipe: true}
        });

        if (!recipeIngredient) {
            throw new NotFoundException(`Recipe Ingredient detail with id ${id} not found`);
        }

        if (recipeIngredient.recipe.authorId !== userId) {
            throw new ForbiddenException("You don't have permission to update ingredients for this recipe!");
        }

        return this.prisma.recipeIngredient.update({
            where: {id},
            data: {
                amount: dto.amount
            },
            include: {ingredient: true}
        });
    }

    async findOne(id: string) {
        const recipeIngredient = await this.prisma.recipeIngredient.findUnique({
            where: {id},
            include: {
                ingredient: true,
            }
        });

        if (!recipeIngredient) {
            throw new NotFoundException(`Recipe Ingredient detail with id ${id} not found`);
        }

        return recipeIngredient;
    }

    async findAllByRecipe(recipeId: string) {
        const recipe = await this.prisma.recipe.findUnique({where: {id: recipeId}});
        if (!recipe) throw new NotFoundException('Recipe not found');

        return this.prisma.recipeIngredient.findMany({
            where: {recipeId},
            include: {
                ingredient: true
            }
        });
    }

    async remove(id: string, userId: string) {
        const recipeIngredient = await this.prisma.recipeIngredient.findUnique({
            where: {id},
            include: {recipe: true}
        });

        if (!recipeIngredient) {
            throw new NotFoundException(`Recipe Ingredient detail with id ${id} not found`);
        }
        if (recipeIngredient.recipe.authorId !== userId) {
            throw new ForbiddenException("You don't have permission to delete this ingredient!");
        }

        return this.prisma.recipeIngredient.delete({
            where: {id}
        });
    }
}