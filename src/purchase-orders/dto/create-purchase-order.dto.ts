import { IsString, IsNumber, IsDateString, ValidateNested, IsArray, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDetailDto {
    @IsString()
    @IsNotEmpty()
    PRD_CODIGO: string;

    @IsNumber()
    @IsNotEmpty()
    DET_ORD_COMPRA_CANTIDAD: number;

    @IsNumber()
    @IsNotEmpty()
    DET_ORD_COMPRA_COSTO_UNITARIO: number;
}

export class CreatePurchaseOrderDto {
    @IsString()
    @IsNotEmpty()
    PRV_RUC: string;

    @IsDateString()
    @IsNotEmpty()
    ORD_FECHA_ENTREGA: string; // ISO Date String

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderDetailDto)
    detalles: CreateOrderDetailDto[];
}
