import {BadRequestException, Injectable} from '@nestjs/common';
import {PaymentService} from '../payment/payment.service';
import {OnEvent} from '@nestjs/event-emitter';
import {PrismaService} from "../../prisma.service";

@Injectable()
export class OrderService {
    constructor(
        private prisma: PrismaService,
        private paymentService: PaymentService,
    ) {
    }

    async checkout(userId: string, ipAddr: string) {
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
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            productName: item.product.name, // Lưu snapshot tên
                            price: item.product.price,      // Lưu snapshot giá
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
            message: 'Tạo đơn hàng thành công',
            orderId: order.id,
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
    async handlePaymentSuccess(payload: any) {
        console.log(`[OrderService] Nhận sự kiện thanh toán thành công cho Order #${payload.orderId}`);

        await this.prisma.order.update({
            where: {id: payload.orderId},
            data: {status: 'PAID'}
        });
    }

    @OnEvent('payment.failed')
    async handlePaymentFailed(payload: any) {
        console.log(`[OrderService] Thanh toán thất bại cho Order #${payload.orderId}`);

        await this.prisma.order.update({
            where: {id: payload.orderId},
            data: {status: 'FAILED'}
        });
    }
}