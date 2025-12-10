import {Module} from '@nestjs/common';
import {OrderService} from './order.service';
import {OrderController} from './order.controller';
import {PrismaService} from "../../prisma.service";
import {PaymentModule} from "../payment/payment.module";
import {PaymentService} from "../payment/payment.service";

@Module({
    imports: [PaymentModule],
    controllers: [OrderController,],
    providers: [OrderService, PrismaService],
})
export class OrderModule {
}
