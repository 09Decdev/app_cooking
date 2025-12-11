import {Module} from '@nestjs/common';
import {CategoryService} from './category.service';
import {CategoryController} from './category.controller';
import {PrismaService} from "../../prisma.service";
import {MinioModule} from "../minio/minio.module";

@Module({
    imports: [MinioModule],
    controllers: [CategoryController],
    providers: [CategoryService, PrismaService],
})
export class CategoryModule {
}
