import {ConflictException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {CreateRecipeDto} from './dto/create-recipe.dto';
import {PrismaService} from "../../prisma.service";
import {MinioService} from "../minio/minio.service";
import {StepDTO} from "./dto/create-step.dto";
import {CreateRecipeIngredientDto} from "./dto/create-ingredient.dto";

@Injectable()
export class RecipeService {
    constructor(private prisma: PrismaService, private readonly minioService: MinioService) {
    }

    async createRecipe(dto: CreateRecipeDto, userId: string, file?: Express.Multer.File) {
        let filename = dto.image;
        if (file) {
            const image = await this.minioService.uploadFile(file);
            filename = image.fileName;
        }

        return this.prisma.recipe.create({
            data: {
                title: dto.title,
                description: dto.description,
                image: filename,
                cookTime: dto.cookTime,
                authorId: userId,
                categoryId: dto.categoryId,

            },
        });
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
            }
        });
    }

    async createSteps(dto: StepDTO, userId: string, recipeId: string, file?: Express.Multer.File) {
        const recipe = await this.prisma.recipe.findUnique({
            where: {id: recipeId},
        });
        if (!recipe) {
            throw new NotFoundException(`Recipe with id ${recipeId} not found`);
        }

        if (recipe.authorId != userId) {
            throw new ForbiddenException("You don't have permission to use this action!");
        }
        const existingStep = await this.prisma.step.findFirst({
            where: {
                recipeId: recipeId,
                order: dto.order
            }
        });

        if (existingStep) {
            throw new ConflictException(`Step order ${dto.order} already exists in this recipe!`);
        }
        let imagePath = dto.image;
        if (file) {
            const uploadResult = await this.minioService.uploadFile(file);
            imagePath = uploadResult.fileName;
        }
        return this.prisma.step.create({
            data: {
                order: dto.order,
                content: dto.content,
                image: imagePath,
                recipeId: recipeId,
            }
        });

    }

    findAll() {
        return this.prisma.recipe.findMany({
            include: {
                category: true,
                author: {select: {id: true, name: true, avatar: true}},
            },
        });
    }

    async findOne(id: string) {
        const recipe = await this.prisma.recipe.findUnique({
            where: {id},
            include: {
                category: true,
                author: {select: {id: true, name: true, avatar: true}},
                ingredients: {
                    include: {ingredient: true},
                },
                steps: {orderBy: {order: 'asc'}},
            },
        });

        if (!recipe) throw new NotFoundException('Không tìm thấy công thức');
        return recipe;
    }

    async remove(id: string, userId: string) {
        const recipe = await this.prisma.recipe.findUnique({where: {id}});
        if (!recipe) throw new NotFoundException('Not found');
        if (recipe.authorId !== userId) {
            throw new ForbiddenException("You don't have permission to delete");
        }
        return this.prisma.recipe.delete({where: {id}});
    }
}