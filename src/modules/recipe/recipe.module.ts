import {Module} from '@nestjs/common';
import {RecipeService} from './service/recipe.service';
import {RecipeController} from './controller/recipe.controller';
import {PrismaService} from "../../prisma.service";
import {MinioModule} from "../minio/minio.module";
import {StepService} from "./service/step.service";
import {DetailIngredientService} from "./service/detail-ingredient.service";

@Module({
    imports: [MinioModule],
    controllers: [RecipeController],
    providers: [RecipeService, PrismaService,StepService,DetailIngredientService],
})
export class RecipeModule {
}
