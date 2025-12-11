import {ForbiddenException, HttpStatus, Injectable, NotFoundException} from '@nestjs/common';
import {CreateCategoryDto} from './dto/create-category.dto';
import {PrismaService} from "../../prisma.service";
import {UpdateCategoryDto} from "./dto/update-category.dto";
import {MinioService} from "../minio/minio.service";

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService, private readonly minioService: MinioService) {
    }

    async create(dto: CreateCategoryDto, userId: string, file?: Express.Multer.File) {
        let image = dto.image;
        if (file) {
            const upload = await this.minioService.uploadFile(file);
            image = upload.fileName;
        }
        return this.prisma.category.create({
            data: {
                name: dto.name,
                image: image,
                authorId: userId,
            }
        });
    }

    async update(id: string, dto: UpdateCategoryDto, userId: string, file?: Express.Multer.File) {
        const category = await this.prisma.category.findUnique({where: {id}});

        if (!category) {
            throw new NotFoundException(`Category with id ${id} not found`);
        }

        if (category.authorId !== userId) {
            throw new ForbiddenException(`You don't have permission to update this category.`);
        }

        let image = category.image;
        if (file) {
            if (category.image) {
                await this.minioService.deleteFile(category.image);
            }
            const upload = await this.minioService.uploadFile(file);
            image = upload.fileName;
        }

        return this.prisma.category.update({
            where: {id},
            data: {
                name: dto.name,
                image: image,
            },
            select: {id: true, name: true, image: true},
        });
    }

    findAll() {
        return this.prisma.category.findMany();
    }

    findOne(id: string) {
        const category = this.prisma.category.findUnique({where: {id}});
        if (!category) {
            throw new NotFoundException(`Category with id ${id} not found`);
        }
    }

    async remove(id: string, userId: string) {
        const category = await this.prisma.category.findUnique({where: {id}});
        if (!category) {
            throw new NotFoundException(`Category with id ${id} not found`);
        }

        if (category.authorId !== userId) {
            throw new ForbiddenException(`You don't have permission to delete this category.`);
        }

        await this.prisma.category.delete({where: {id}});

        return {
            status: HttpStatus.OK,
            body: "delete successfully."
        };
    }
}