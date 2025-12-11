import {Body, Controller, Get, Ip, Post, UseGuards} from '@nestjs/common';
import {OrderService} from './order.service';
import {AuthGuard} from '@nestjs/passport';
import {GetUser} from "../../common/get-user.decorator";
import {CreateOrderDto} from "./dto/create-order.dto";


@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrderController {
    constructor(private readonly orderService: OrderService) {
    }

    @Post('checkout')
    checkout(
        @GetUser('id') userId: string,
        @Ip() ip: string,
        @Body()dto: CreateOrderDto
    ) {
        return this.orderService.checkout(userId, ip,dto);
    }

    @Get()
    getMyOrders(@GetUser('id') userId: string) {
        return this.orderService.getMyOrders(userId);
    }
}