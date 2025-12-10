import {Controller, Get, Ip, Post, UseGuards} from '@nestjs/common';
import {OrderService} from './order.service';
import {AuthGuard} from '@nestjs/passport';
import {GetUser} from "../../common/get-user.decorator";


@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrderController {
    constructor(private readonly orderService: OrderService) {
    }

    @Post('checkout')
    checkout(
        @GetUser('id') userId: string,
        @Ip() ip: string
    ) {
        return this.orderService.checkout(userId, ip);
    }

    @Get()
    getMyOrders(@GetUser('id') userId: string) {
        return this.orderService.getMyOrders(userId);
    }
}