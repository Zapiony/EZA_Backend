import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
    @IsString()
    @IsNotEmpty()
    PRD_CODIGO: string;

    @IsNumber()
    @Min(1)
    cantidad: number;
}

export class CheckoutDto {
    @IsString()
    @IsNotEmpty()
    cedulaFactura: string;

    @IsString()
    @IsNotEmpty()
    formaPago: string;
}
