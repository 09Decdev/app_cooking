import {Module} from '@nestjs/common';
import {RecipeService} from './recipe.service';
import {RecipeController} from './recipe.controller';
import {PrismaService} from "../../prisma.service";
import {MinioModule} from "../minio/minio.module";

@Module({
    imports: [MinioModule],
    controllers: [RecipeController],
    providers: [RecipeService, PrismaService],
})
export class RecipeModule {
}
