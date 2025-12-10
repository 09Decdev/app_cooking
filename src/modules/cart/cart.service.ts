import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../../prisma.service";
import {AddToCartDto} from "./dto/create-cart.dto";


@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) {
    }

    async addToCart(userId: string, dto: AddToCartDto) {
        const product = await this.prisma.product.findUnique({where: {id: dto.productId}});
        if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

        let cart = await this.prisma.cart.findUnique({where: {userId}});
        if (!cart) {
            cart = await this.prisma.cart.create({data: {userId}});
        }

        const existingItem = await this.prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: dto.productId,
            },
        });

        if (existingItem) {
            return this.prisma.cartItem.update({
                where: {id: existingItem.id},
                data: {quantity: existingItem.quantity + dto.quantity},
            });
        } else {
            return this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: dto.productId,
                    quantity: dto.quantity,
                },
            });
        }
    }

    async getCart(userId: string) {
        const cart = await this.prisma.cart.findUnique({
            where: {userId},
            include: {
                items: {
                    include: {product: true},
                    orderBy: {id: 'desc'}
                },
            },
        });

        if (!cart) return {items: [], totalPrice: 0};

        const totalPrice = cart.items.reduce((sum, item) => {
            return sum + (item.quantity * item.product.price);
        }, 0);

        return {...cart, totalPrice};
    }

    async removeItem(userId: string, itemId: string) {
        const remove = await this.prisma.cart.findUnique({where: {userId: userId}});
        if (!remove) {
            throw new NotFoundException("Not found.");
        }
        if (remove.userId != userId) throw new ForbiddenException("You dont have permission to remove this cart.");
        return this.prisma.cartItem.delete({where: {id: itemId}});
    }
}