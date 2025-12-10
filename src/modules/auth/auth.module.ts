import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {JwtModule} from "@nestjs/jwt";
import {PrismaService} from "../../prisma.service";
import {JwtStrategy} from "./jwt.strategy";
import {MinioService} from "../minio/minio.service";

@Module({
    imports: [JwtModule.register({})],
    controllers: [AuthController],
    providers: [AuthService, PrismaService, JwtStrategy,MinioService],
})
export class AuthModule {
}
