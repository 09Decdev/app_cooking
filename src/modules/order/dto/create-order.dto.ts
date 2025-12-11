import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    recipientName: string;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsOptional()
    note?: string;
}
