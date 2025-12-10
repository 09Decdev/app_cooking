import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../../prisma.service";
import {UpdateUserDto} from "./dto/update-user.dto";
import {MinioService} from "../minio/minio.service";

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService, private readonly minioService: MinioService) {
    }

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                createdAt: true,
            },
        });
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: {id},
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                recipes: true,
            },
        });

        if (!user) throw new NotFoundException('Không tìm thấy người dùng');
        return user;
    }

    async update(id: string, dto: UpdateUserDto, file?: Express.Multer.File) {
        const update = await this.prisma.user.findUnique({
            where: {id},
        });
        if (!update) {
            throw new NotFoundException(`Not found user with userId ${id}`);
        }

        if (update.id != id) {
            throw new ForbiddenException('You not have permission to update user');
        }
        if (file) {

            if (update.avatar) {
                await this.minioService.deleteFile(update.avatar);
            }

            const uploadResult = await this.minioService.uploadFile(file);

            dto.avatar = uploadResult.fileName;
        }
        // else if (dto.avatar === null || dto.avatar === "") {
        //     if (update.avatar) {
        //         await this.minioService.deleteFile(update.avatar);
        //     }
        // }
        return this.prisma.user.update({
            where: {id},
            data: {
                ...dto,
            },
            select: {id: true, name: true, avatar: true, email: true}, // Trả về data mới
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.user.delete({
            where: {id},
            select: {id: true, email: true},
        });
    }
}
