import {Module} from '@nestjs/common';
import {UserController} from "./user.controller";
import {UserService} from "./user.service";
import {PrismaService} from "../../prisma.service";
import {MinioService} from "../minio/minio.service";

@Module({
    imports: [],
    controllers: [UserController],
    providers: [UserService, PrismaService, MinioService],
})
export class UserModule {
}
