import { VnpayService } from "nestjs-vnpay";
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { dateFormat, QueryDr, ReturnQueryFromVNPay, VerifyReturnUrl, VnpLocale } from "vnpay";
import { EventEmitter2 } from "@nestjs/event-emitter";

import {
    IpnRspCode,
    PaymentExpiry,
    TransactionCurrency,
    TransactionItemType,
    TransactionStatus,
    VnpayResponseCode,
    VnpayTransactionStatus
} from "./enum/transaction.enum";
import { PrismaService } from "../../prisma.service";
import { VNPayResponseMessagesService } from "./exceptions/vnpay_response"; // Giả định bạn có service này

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private readonly vnpayService: VnpayService,
        private readonly prismaService: PrismaService,
        private readonly vnPayResponseMessagesService: VNPayResponseMessagesService,
        private readonly eventEmitter: EventEmitter2
    ) {}

    async getBankList() {
        const bankList = await this.vnpayService.getBankList();
        if (!bankList) {
            throw new NotFoundException("Bank list not found");
        }
        return bankList;
    }

    async createPaymentOrder(ipAddress: string, userId: string, orderId: string) {
        const order = await this.prismaService.order.findUnique({ where: { id: orderId } });

        if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
        if (order.userId !== userId) throw new ForbiddenException('Không có quyền thanh toán đơn này');
        if (order.status === 'PAID') throw new BadRequestException('Đơn hàng đã thanh toán rồi');

        const amount = order.totalPrice;
        const orderInfo = `Thanh toan don hang #${orderId}`;
        const expire = 15;

        const newTransaction = await this.createTransaction({
            userId: userId,
            amount: amount,
            orderInfo: orderInfo,
            itemType: TransactionItemType.PAYMENT_ORDER,
            itemId: orderId,
            currency: TransactionCurrency.VND,
            subscriptionId: null,
            expiresAfterMinutes: expire,
        });

        return this.buildVnpayUrl({
            amount: amount,
            ipAddr: ipAddress,
            txnRef: newTransaction.id,
            orderInfo: orderInfo,
            locale: VnpLocale.VN,
            expiresAfterMinutes: expire,
        });
    }

    async verifyReturnUrl(vnpayQuery: ReturnQueryFromVNPay): Promise<VerifyReturnUrl & { txnRef?: string }> {
        const verify = await this.vnpayService.verifyReturnUrl(vnpayQuery);
        const txnRef = vnpayQuery.vnp_TxnRef;
        return { ...verify, txnRef: txnRef };
    }

    async handleVnpayIpn(vnpayQuery: ReturnQueryFromVNPay) {
        const txnRef = vnpayQuery.vnp_TxnRef;
        this.logger.log(`[IPN] Received for txnRef: ${txnRef}`);

        const verify = await this.vnpayService.verifyReturnUrl(vnpayQuery);
        if (!verify.isVerified) {
            return { RspCode: IpnRspCode.CHECKSUM_FAILED, Message: 'Checksum failed' };
        }

        const transaction = await this.prismaService.transaction.findUnique({ where: { id: txnRef } });
        if (!transaction) {
            return { RspCode: IpnRspCode.ORDER_NOT_FOUND, Message: 'Order not found' };
        }

        await this._confirmTransaction(txnRef, verify, vnpayQuery);

        return { RspCode: IpnRspCode.SUCCESS, Message: 'Success' };
    }

    async requeryTransactionHistory(transactionId: string) {
        const transaction = await this.prismaService.transaction.findUnique({
            where: { id: transactionId },
        });

        if (!transaction) {
            throw new NotFoundException("Transaction not found");
        }

        // B. Chuẩn bị params gọi sang VNPay
        const vnp_RequestId = `${transaction.id}-q-${Date.now()}`;
        const queryDrParams: QueryDr = {
            vnp_RequestId: vnp_RequestId,
            vnp_TxnRef: transaction.id,
            vnp_OrderInfo: `Truy van ket qua giao dich ${transaction.id}`,
            vnp_TransactionDate: dateFormat(transaction.createdAt), // Lưu ý: hàm dateFormat của vnpay library
            vnp_CreateDate: dateFormat(new Date()),
            vnp_IpAddr: '127.0.0.1',
            vnp_TransactionNo: transaction.vnp_TransactionNo ? Number(transaction.vnp_TransactionNo) : 0,
        };

        // C. Gọi API QueryDR của VNPay
        const vnpayStatus = await this.vnpayService.queryDr(queryDrParams);
        this.logger.log(`[Requery] QueryDR for ${transaction.id}: ${vnpayStatus?.vnp_ResponseCode}`);

        // D. Xử lý kết quả trả về (Cập nhật DB nếu cần)
        await this.processQueryDrResponse(vnpayStatus, transaction);

        // E. Trả về thông tin mới nhất
        return this.prismaService.transaction.findUnique({
            where: { id: transactionId },
        });
    }

    private async processQueryDrResponse(vnpayStatus: any, transaction: any) {
        const responseCode = vnpayStatus?.vnp_ResponseCode;
        const message = this.vnPayResponseMessagesService?.getVnpayMessage(responseCode) || `QueryDR Code: ${responseCode}`;

        // Chỉ xử lý nếu DB đang là PENDING (để tránh ghi đè giao dịch đã xong)
        if (transaction.status !== TransactionStatus.PENDING) {
            return;
        }

        switch (responseCode) {
            case VnpayResponseCode.SUCCESS:
                if (vnpayStatus.vnp_TransactionStatus === VnpayTransactionStatus.SUCCESS) {
                    this.logger.log(`[QueryDR] Giao dịch ${transaction.id} THÀNH CÔNG.`);

                    await this.prismaService.transaction.update({
                        where: { id: transaction.id },
                        data: {
                            status: TransactionStatus.COMPLETED,
                            vnp_TransactionNo: vnpayStatus.vnp_TransactionNo,
                            vnp_BankCode: vnpayStatus.vnp_BankCode,
                            vnp_PayDate: vnpayStatus.vnp_PayDate,
                        }
                    });

                    // Ghi lịch sử
                    await this.createTransactionHistory(transaction.id, TransactionStatus.COMPLETED, "Thành công (QueryDR)", responseCode);

                    // Kích hoạt Event Emitter
                    await this.handleSuccessfulPayment(transaction);

                } else if (vnpayStatus.vnp_TransactionStatus === VnpayTransactionStatus.PENDING) {
                    // Nếu vẫn Pending -> Check hết hạn
                    if (transaction.expiresAt && transaction.expiresAt < new Date()) {
                        this.logger.warn(`[QueryDR] Giao dịch ${transaction.id} đã hết hạn.`);
                        await this.prismaService.transaction.update({
                            where: { id: transaction.id },
                            data: { status: TransactionStatus.EXPIRED }
                        });
                        await this.handleFailedPayment(transaction);
                    }
                } else {
                    // Các trạng thái khác -> Failed
                    await this.prismaService.transaction.update({
                        where: { id: transaction.id },
                        data: { status: TransactionStatus.FAILED }
                    });
                    await this.createTransactionHistory(transaction.id, TransactionStatus.FAILED, `Thất bại (QueryDR: ${vnpayStatus.vnp_TransactionStatus})`, responseCode);
                    await this.handleFailedPayment(transaction);
                }
                break;

            // Các case lỗi khác của API QueryDR
            default:
                // Tùy logic, có thể đánh dấu Failed hoặc Expired
                break;
        }
    }

    // --- HELPER: XÁC NHẬN GIAO DỊCH (Dùng cho IPN) ---
    private async _confirmTransaction(txnRef: string, verify: VerifyReturnUrl, vnpayQuery: ReturnQueryFromVNPay): Promise<number> {
        const transaction = await this.prismaService.transaction.findUnique({ where: { id: txnRef } });
        if (!transaction || transaction.status !== TransactionStatus.PENDING) return 0;

        const amountDb = transaction.amount;
        const amountRes = Number(vnpayQuery.vnp_Amount) / 100;

        if (amountDb !== amountRes) {
            await this.createTransactionHistory(txnRef, TransactionStatus.FAILED, 'Amount mismatch', vnpayQuery.vnp_ResponseCode);
            await this.handleFailedPayment(transaction);
            return 0;
        }

        const isSuccess = verify.isSuccess;
        const newStatus = isSuccess ? TransactionStatus.COMPLETED : TransactionStatus.FAILED;
        let updatedCount = 0;

        await this.prismaService.$transaction(async (prisma) => {
            const updatedTransaction = await prisma.transaction.updateMany({
                where: { id: txnRef, status: TransactionStatus.PENDING },
                data: {
                    status: newStatus,
                    vnp_TransactionNo: vnpayQuery.vnp_TransactionNo ? String(vnpayQuery.vnp_TransactionNo) : undefined,
                    vnp_BankCode: vnpayQuery.vnp_BankCode,
                    vnp_PayDate: vnpayQuery.vnp_PayDate ? String(vnpayQuery.vnp_PayDate) : undefined,
                }
            });
            updatedCount = updatedTransaction.count;

            if (updatedCount > 0) {
                await prisma.transactionHistory.create({
                    data: {
                        transactionId: txnRef,
                        status: newStatus,
                        message: verify.message,
                        vnp_ResponseCode: vnpayQuery.vnp_ResponseCode ? String(vnpayQuery.vnp_ResponseCode) : null
                    }
                });
            }
        });

        if (updatedCount > 0) {
            if (isSuccess) {
                await this.handleSuccessfulPayment(transaction);
            } else {
                await this.handleFailedPayment(transaction);
            }
        }
        return updatedCount;
    }

    // --- HELPER: EVENT EMITTER ---
    private async handleSuccessfulPayment(transaction: any) {
        this.logger.log(`Thanh toán thành công: ${transaction.id}`);
        this.eventEmitter.emit('payment.success', {
            transactionId: transaction.id,
            orderId: transaction.itemId,
            status: 'PAID'
        });
    }

    private async handleFailedPayment(transaction: any) {
        this.logger.warn(`Thanh toán thất bại: ${transaction.id}`);
        this.eventEmitter.emit('payment.failed', {
            transactionId: transaction.id,
            orderId: transaction.itemId,
            status: 'FAILED'
        });
    }

    // --- HELPER: COMMON ---
    private buildVnpayUrl(params: any): string {
        let cleanIpAddr = params.ipAddr || '127.0.0.1';
        if (cleanIpAddr === '::1') cleanIpAddr = '127.0.0.1';
        if (cleanIpAddr.startsWith('::ffff:')) cleanIpAddr = cleanIpAddr.substring(7);

        const createDate = new Date();
        const expireDate = new Date(createDate);
        expireDate.setMinutes(createDate.getMinutes() + (params.expiresAfterMinutes || 15));

        return this.vnpayService.buildPaymentUrl({
            vnp_Amount: params.amount,
            vnp_IpAddr: cleanIpAddr,
            vnp_TxnRef: params.txnRef,
            vnp_OrderInfo: params.orderInfo,
            vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || `http://localhost:3000/payment/vnpay-return`,
            vnp_Locale: params.locale || VnpLocale.VN,
            vnp_CreateDate: dateFormat(createDate),
            vnp_ExpireDate: dateFormat(expireDate),
        });
    }

    private async createTransaction(input: any) {
        const now = new Date();
        const expireDate = new Date(now.getTime() + input.expiresAfterMinutes * 60 * 1000);

        const newTransaction = await this.prismaService.transaction.create({
            data: {
                userId: input.userId,
                amount: input.amount,
                orderInfo: input.orderInfo,
                itemType: input.itemType,
                itemId: input.itemId,
                subscriptionId: input.subscriptionId || null,
                status: TransactionStatus.PENDING,
                currency: input.currency || TransactionCurrency.VND,
                expiresAt: expireDate,
            }
        });
        await this.createTransactionHistory(newTransaction.id, TransactionStatus.PENDING, 'Khởi tạo', null);
        return newTransaction;
    }

    private async createTransactionHistory(txnId: string, status: string, message: string, responseCode: any) {
        try {
            await this.prismaService.transactionHistory.create({
                data: {
                    transactionId: txnId,
                    status: status,
                    message: message,
                    vnp_ResponseCode: responseCode ? String(responseCode) : null
                }
            });
        } catch (e) {
            this.logger.error(`Error logging history: ${e.message}`);
        }
    }
}