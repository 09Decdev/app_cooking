import {IsNumberString, IsOptional, IsString} from 'class-validator';

export class VnpayReturnDto {
    @IsString()
    @IsOptional()
    vnp_TmnCode?: string;

    @IsNumberString()
    vnp_Amount: string;

    @IsString()
    @IsOptional()
    vnp_BankCode?: string;

    @IsString()
    @IsOptional()
    vnp_BankTranNo?: string;

    @IsString()
    @IsOptional()
    vnp_CardType?: string;

    @IsString()
    @IsOptional()
    vnp_PayDate?: string;

    @IsString()
    vnp_OrderInfo: string;

    @IsString()
    @IsOptional()
    vnp_TransactionNo?: string;

    @IsString()
    vnp_ResponseCode: string;

    @IsString()
    vnp_TransactionStatus: string;

    @IsString()
    vnp_TxnRef: string;

    @IsString()
    vnp_SecureHash: string;
}