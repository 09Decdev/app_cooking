import {Controller, Get, Ip, Param, Post, Query, Res, UseGuards} from "@nestjs/common";
import type {Response} from 'express';
import {PaymentService} from "./payment.service";
import {GetUser} from "../../common/get-user.decorator";
import {AuthGuard} from "@nestjs/passport";
import {VnpayReturnDto} from "./dto/vnpay-return.dto";

@Controller("payment")
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {
    }

    @Get('/bank_lists')
    async getBanklists() {
        return await this.paymentService.getBankList();
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/payment/:orderId')
    async createPaymentCommunity(@GetUser('id') userId: string,
                                 @Param('orderId') orderId: string,
                                 @Ip() clientIp: string) {

        const url = await this.paymentService.createPaymentOrder(clientIp, userId, orderId);
        return {paymentUrl: url};
    }


    @Get('vnpay-ipn')
    async vnpayIpn(
        @Query() vnpayQuery: VnpayReturnDto,
        @Res() res: Response,
    ) {
        console.log('ĐÃ NHẬN ĐƯỢC IPN:', vnpayQuery);
        const ipnResponse = await this.paymentService.handleVnpayIpn(vnpayQuery);

        res.json(ipnResponse);
    }


}