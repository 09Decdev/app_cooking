import {Module} from '@nestjs/common';
import {PaymentController} from './payment.controller';
import {PaymentService} from './payment.service';
import {VnpayModule} from 'nestjs-vnpay';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {HashAlgorithm} from 'vnpay';
import {EventEmitterModule} from '@nestjs/event-emitter'; // 1. Import
import {VNPayResponseMessagesService} from './exceptions/vnpay_response';
import {PrismaService} from "../../prisma.service";

@Module({
    imports: [
        ConfigModule,
        EventEmitterModule.forRoot(),
        VnpayModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const tmnCode = configService.get<string>('VNPAY_TMN_CODE') || configService.get<string>('TMN_CODE');
                const secureSecret = configService.get<string>('VNPAY_HASH_SECRET') || configService.get<string>('SECURITY_SECRET');

                if (!tmnCode || !secureSecret) {
                    throw new Error('VNPAY TmnCode hoặc SecureSecret chưa được cài trong .env');
                }

                return {
                    tmnCode,
                    secureSecret,
                    vnpayHost: configService.get<string>('VNPAY_HOST') || 'https://sandbox.vnpayment.vn',
                    testMode: true,
                    enableLog: true,
                    hashAlgorithm: HashAlgorithm.SHA512,
                };
            },
        }),
    ],
    controllers: [PaymentController],
    providers: [
        PaymentService,
        VNPayResponseMessagesService,
        PrismaService,
    ],
    exports: [PaymentService],
})
export class PaymentModule {
}