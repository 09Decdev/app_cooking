import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
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
import {seconds, ThrottlerGuard, ThrottlerModule} from "@nestjs/throttler";
import {APP_GUARD} from "@nestjs/core";
import {ThrottlerStorageRedisService} from "@nest-lab/throttler-storage-redis";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    name: 'short',
                    ttl: seconds(8),
                    limit: 10,
                    blockDuration: seconds(30),
                },
                {
                    name: 'medium',
                    ttl: seconds(30),
                    limit: 15000,
                    blockDuration: seconds(60),
                },
                {
                    name: 'long',
                    ttl: seconds(60),
                    limit: 20000,
                    blockDuration: seconds(120),
                },
            ],
            storage: new ThrottlerStorageRedisService({
                host: process.env.REDIS_HOST || 'localhost',
                port: Number(process.env.REDIS_PORT) || 6379,
            }),
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
    providers: [
        UserService,
        PrismaService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {
}
