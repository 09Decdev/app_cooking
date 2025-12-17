import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {CreateRecipeDto} from '../dto/creat/create-recipe.dto';
import {PrismaService} from "../../../prisma.service";
import {MinioService} from "../../minio/minio.service";
import {UpdateRecipeDto} from "../dto/update/update-recipe.dto";

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

    async updateRecipe(userId: string, id: string, dto: UpdateRecipeDto, file?: Express.Multer.File) {
        const recipe = await this.prisma.recipe.findUnique({
            where: {id},
        });

        if (!recipe) {
            throw new NotFoundException('No recipe found.');
        }

        if (recipe.authorId !== userId) {
            throw new ForbiddenException(
                'You do not have permission to update this recipe',
            );
        }

        let filename = recipe.image;
        if (file) {
            const uploadedImage = await this.minioService.uploadFile(file);
            if (filename) {
                await this.minioService.deleteFile(filename);
            }
            filename = uploadedImage.fileName;
        }

        return this.prisma.recipe.update({
            where: {id},
            data: {
                title: dto.title?.trim(),
                description: dto.description,
                cookTime: dto.cookTime,
                categoryId: dto.categoryId,
                image: filename,
            },
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