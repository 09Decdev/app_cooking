import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';
import {AddToCartDto} from "./dto/create-cart.dto";
import {GetUser} from "../../common/get-user.decorator";

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Post()
    addToCart(@GetUser('id') userId: string, @Body() dto: AddToCartDto) {
        return this.cartService.addToCart(userId, dto);
    }

    @Get()
    getCart(@GetUser('id') userId: string) {
        return this.cartService.getCart(userId);
    }

    @Delete(':itemId')
    removeItem(@GetUser('id') userId: string, @Param('itemId') itemId: string) {
        return this.cartService.removeItem(userId, itemId);
    }
}