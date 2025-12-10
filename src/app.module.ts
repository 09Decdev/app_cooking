import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {AuthModule} from './modules/auth/auth.module';
import {UserController} from './modules/user/user.controller';
import {UserService} from './modules/user/user.service';
import {UserModule} from './modules/user/user.module';
import {CategoryModule} from './modules/category/category.module';
import {IngredientModule} from './modules/ingredient/ingredient.module';
import {ReviewModule} from './modules/review/review.module';
import {ProductModule} from './modules/product/product.module';
import {CartModule} from './modules/cart/cart.module';
import {OrderModule} from './modules/order/order.module';
import {PaymentModule} from './modules/payment/payment.module';
import {CommonModule} from './common/common.module';
import {RecipeModule} from './modules/recipe/recipe.module';
import {PrismaService} from './prisma.service';
import {MinioModule} from './modules/minio/minio.module';
import {EventEmitterModule} from "@nestjs/event-emitter";
import {VnpayModule} from "nestjs-vnpay";
import {HashAlgorithm} from "vnpay";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        AuthModule,
        UserModule,
        CategoryModule,
        IngredientModule,
        RecipeModule,
        ReviewModule,
        ProductModule,
        CartModule,
        OrderModule,
        PaymentModule,
        CommonModule,
        MinioModule,
    ],
    controllers: [UserController],
    providers: [UserService, PrismaService],
})
export class AppModule {
}
