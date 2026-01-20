import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    PRD_CODIGO: string;

    @IsString() // Changed to string
    @IsNotEmpty()
    CAT_CODIGO: string;

    @IsString()
    @IsNotEmpty()
    PRD_DESCRIPCION: string;

    @IsNumber()
    @IsNotEmpty()
    PRD_PRECIO: number;

    @IsNumber()
    @IsNotEmpty()
    PRD_COSTO_ADQUISICION: number;
}
