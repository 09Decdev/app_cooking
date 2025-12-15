import {ConflictException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {MinioService} from '../../minio/minio.service';
import {UpdateStepDto} from '../dto/update/update-step.dto';
import {StepDTO} from '../dto/creat/create-step.dto';
import {PrismaService} from "../../../prisma.service";

@Injectable()
export class StepService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly minioService: MinioService
    ) {
    }

    async createSteps(dto: StepDTO, userId: string, recipeId: string, file?: Express.Multer.File) {
        const recipe = await this.prisma.recipe.findUnique({where: {id: recipeId}});
        if (!recipe) throw new NotFoundException(`Recipe with id ${recipeId} not found`);

        if (recipe.authorId !== userId) {
            throw new ForbiddenException("You don't have permission to use this action!");
        }

        const existingStep = await this.prisma.step.findFirst({
            where: {recipeId: recipeId, order: dto.order}
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

    async updateStep(stepId: string, dto: UpdateStepDto, userId: string, file?: Express.Multer.File) {
        const step = await this.prisma.step.findUnique({
            where: {id: stepId},
            include: {recipe: true},
        });

        if (!step) throw new NotFoundException(`Step with id ${stepId} not found`);
        if (step.recipe.authorId !== userId) throw new ForbiddenException("You don't have permission to update this step!");

        let imagePath = dto.image;
        if (file) {
            if (step.image) await this.minioService.deleteFile(step.image);

            const uploadResult = await this.minioService.uploadFile(file);
            imagePath = uploadResult.fileName;
        }

        return this.prisma.step.update({
            where: {id: stepId},
            data: {
                content: dto.content,
                image: imagePath,
            },
        });
    }

    async remove(stepId: string, userId: string) {
        const step = await this.prisma.step.findUnique({
            where: {id: stepId},
            include: {recipe: true}
        });

        if (!step) throw new NotFoundException(`Step with id ${stepId} not found`);

        if (step.recipe.authorId !== userId) {
            throw new ForbiddenException("You don't have permission to delete this step!");
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.step.delete({
                where: {id: stepId}
            });

            await tx.step.updateMany({
                where: {
                    recipeId: step.recipeId,
                    order: {gt: step.order}
                },
                data: {
                    order: {decrement: 1}
                }
            });
        });

        if (step.image) {
            await this.minioService.deleteFile(step.image);
        }

        return {message: 'Step deleted and orders updated successfully'};
    }

    async getAll(recipeId: string) {
        return this.prisma.step.findMany({
            where: {recipeId},
            orderBy: {order: 'asc'},
        });
    }


    async findOne(stepId: string) {
        const step = await this.prisma.step.findUnique({
            where: {id: stepId}
        });

        if (!step) throw new NotFoundException(`Step with id ${stepId} not found`);

        return step;
    }
}