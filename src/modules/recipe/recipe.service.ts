import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import {PrismaService} from "../../prisma.service";

@Injectable()
export class RecipeService {
    constructor(private prisma: PrismaService) {}

    async create(dto: CreateRecipeDto, userId: string) {
        return this.prisma.recipe.create({
            data: {
                title: dto.title,
                description: dto.description,
                image: dto.image,
                cookTime: dto.cookTime,
                authorId: userId,
                categoryId: dto.categoryId,

                ingredients: {
                    create: dto.ingredients.map((item) => ({
                        amount: item.amount,
                        ingredientId: item.ingredientId,
                    })),
                },

                steps: {
                    create: dto.steps.map((step) => ({
                        order: step.order,
                        content: step.content,
                        image: step.image,
                    })),
                },
            },
            include: {
                steps: true,
                ingredients: {
                    include: { ingredient: true }
                }
            }
        });
    }

    findAll() {
        return this.prisma.recipe.findMany({
            include: {
                category: true,
                author: { select: { id: true, name: true, avatar: true } },
            },
        });
    }

    async findOne(id: string) {
        const recipe = await this.prisma.recipe.findUnique({
            where: { id },
            include: {
                category: true,
                author: { select: { id: true, name: true, avatar: true } },
                steps: { orderBy: { order: 'asc' } },
                ingredients: {
                    include: { ingredient: true },
                },
            },
        });

        if (!recipe) throw new NotFoundException('Không tìm thấy công thức');
        return recipe;
    }

    async remove(id: string, userId: string) {
        const recipe = await this.prisma.recipe.findUnique({ where: { id } });
        if (!recipe) throw new NotFoundException('Not found');
        if (recipe.authorId !== userId) {
            throw new ForbiddenException("You don't have permission to delete");
        }
        return this.prisma.recipe.delete({ where: { id } });
    }
}