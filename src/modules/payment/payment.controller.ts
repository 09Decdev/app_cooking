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

    @Get('vnpay-return')
    async handleVnpayReturn(
        @Query() vnpayQuery: VnpayReturnDto,
        @Res() res: Response,
    ) {
        const verifyResult = await this.paymentService.verifyReturnUrl(vnpayQuery);

        const deepLinkSuccess = 'myflutterapp://payment/success';
        const deepLinkFailed = 'myflutterapp://payment/failed';

        if (verifyResult.isSuccess && verifyResult.isVerified) {

            return res.redirect(`${deepLinkSuccess}?orderId=${verifyResult.txnRef}`);
        } else {
            return res.redirect(`${deepLinkFailed}?orderId=${verifyResult.txnRef}`);
        }

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

    @Get('requery/:id')
    async manualRequery(@Param('id') id: string) {
        return this.paymentService.requeryTransactionHistory(id);
    }
}