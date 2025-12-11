import {BadRequestException, Injectable} from '@nestjs/common';
import {PaymentService} from '../payment/payment.service';
import {OnEvent} from '@nestjs/event-emitter';
import {PrismaService} from "../../prisma.service";
import {CreateOrderDto} from "./dto/create-order.dto";

@Injectable()
export class OrderService {
    constructor(
        private prisma: PrismaService,
        private paymentService: PaymentService,
    ) {
    }

    async checkout(userId: string, ipAddr: string, dto: CreateOrderDto) {
        const cart = await this.prisma.cart.findUnique({
            where: {userId},
            include: {items: {include: {product: true}}},
        });

        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Giỏ hàng trống');
        }

        const totalAmount = cart.items.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);

        const order = await this.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId: userId,
                    totalPrice: totalAmount,
                    status: 'PENDING',
                    userName: dto.recipientName,
                    phoneNumber: dto.phoneNumber,
                    address: dto.address,
                    note: dto.note,
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            productName: item.product.name,
                            price: item.product.price,
                            quantity: item.quantity,
                        })),
                    },
                },
            });

            await tx.cartItem.deleteMany({where: {cartId: cart.id}});

            return newOrder;
        });

        const paymentUrl = await this.paymentService.createPaymentOrder(
            ipAddr,
            userId,
            order.id
        );

        return {
            message: 'Đơn hàng đã được tạo',
            orderId: order.id,
            totalAmount,
            paymentUrl: paymentUrl
        };
    }

    async getMyOrders(userId: string) {
        return this.prisma.order.findMany({
            where: {userId},
            include: {items: true},
            orderBy: {createdAt: 'desc'},
        });
    }

    @OnEvent('payment.success')
    async handlePaymentSuccess(payload: { orderId: string }) {
        console.log(`[OrderService] Payment SUCCESS for Order #${payload.orderId}`);

        await this.prisma.order.update({
            where: {id: payload.orderId},
            data: {status: 'PAID'}
        });

    }

    @OnEvent('payment.failed')
    async handlePaymentFailed(payload: { orderId: string }) {
        console.log(`[OrderService] Payment FAILED for Order #${payload.orderId}`);

        await this.prisma.order.update({
            where: {id: payload.orderId},
            data: {status: 'FAILED'}
        });
    }
}