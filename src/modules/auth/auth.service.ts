import {ForbiddenException, Injectable} from '@nestjs/common';
import {LoginDto, RegisterDto} from './dto/auth.dto';
import * as argon2 from 'argon2';
import {JwtService} from '@nestjs/jwt';
import {PrismaService} from "../../prisma.service";
import {MinioService} from "../minio/minio.service";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private minioService: MinioService,
    ) {
    }

    async register(dto: RegisterDto, file?: Express.Multer.File) {
        const exists = await this.prisma.user.findUnique({
            where: {email: dto.email},
        });
        if (exists) throw new ForbiddenException('Email đã tồn tại');

        if (file) {
            const uploadResult = await this.minioService.uploadFile(file);
            dto.avatar = uploadResult.fileName;
        }
        const hashedPassword = await argon2.hash(dto.password);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                name: dto.name,
                avatar: dto.avatar,
            },
        });

        const tokens = await this.signToken(user.id, user.email, user.role);

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                createdAt: user.createdAt
            }
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: {email: dto.email},
        });
        if (!user) throw new ForbiddenException('Sai email hoặc mật khẩu');

        const match = await argon2.verify(user.password, dto.password);
        if (!match) throw new ForbiddenException('Sai email hoặc mật khẩu');

        return this.signToken(user.id, user.email, user.role);
    }

    async signToken(userId: string, email: string, role: string) {
        const payload = {sub: userId, email, role};
        const token = await this.jwtService.signAsync(payload, {
            expiresIn: '1d',
            secret: process.env.JWT_SECRET || 'SUPER_SECRET_KEY',
        });

        return {
            access_token: token,
            user: {id: userId, email, name: email.split('@')[0], role}
        };
    }
}