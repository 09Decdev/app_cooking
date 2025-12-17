import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {CreateProductDto} from './dto/create-product.dto';
import {UpdateProductDto} from './dto/update-product.dto';
import {MinioService} from '../minio/minio.service';
import {PrismaService} from "../../prisma.service";

@Injectable()
export class ProductService {
    constructor(
        private prisma: PrismaService,
        private minioService: MinioService,
    ) {
    }

    async create(dto: CreateProductDto, userId: string, file?: Express.Multer.File) {
        if (file) {
            const uploadResult = await this.minioService.uploadFile(file);
            dto.image = uploadResult.fileName;
        }

        return this.prisma.product.create({
            data: {
                name: dto.name,
                price: dto.price,
                description: dto.description,
                manufacturer:dto.manufacturer,
                image: dto.image,
                authorId: userId,
                ingredientId: dto.ingredientId || null,
            },
        });
    }

    async update(id: string, dto: UpdateProductDto, userId: string, file?: Express.Multer.File) {
        const product = await this.prisma.product.findUnique({where: {id}});
        if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

        if (product.authorId != userId) {
            throw new ForbiddenException("You not permission to perform this action");
        }

        if (file) {
            if (product.image) {
                await this.minioService.deleteFile(product.image);
            }
            const uploadResult = await this.minioService.uploadFile(file);
            dto.image = uploadResult.fileName;
        }

        return this.prisma.product.update({
            where: {id},
            data: {...dto},
        });
    }

    findAll() {
        return this.prisma.product.findMany({
            include: {
                ingredient: true,
            },
            orderBy: {name: 'asc'}
        });
    }

    findOne(id: string) {
        return this.prisma.product.findUnique({
            where: {id},
            include: {ingredient: true},
        });
    }

    async remove(id: string, userId: string) {
        const product = await this.findOne(id);
        if (!product) throw new NotFoundException('Not found');

        if (product.authorId != userId) {
            throw new ForbiddenException("You not permission to perform this action");
        }

        if (product.image) {
            await this.minioService.deleteFile(product.image);
        }

        return this.prisma.product.delete({where: {id}});
    }

    async search(keyword: string) {
        if (!keyword?.trim()) {
            throw new BadRequestException('Search keyword is required');
        }

        return this.prisma.product.findMany({
            where: {
                name: {
                    contains: keyword,
                    mode: 'insensitive',
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
}