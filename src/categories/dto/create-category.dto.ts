import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    CAT_CODIGO: string;

    @IsString()
    @IsNotEmpty()
    CAT_NOMBRE: string;

    @IsString()
    @IsNotEmpty()
    CAT_DESCRIPCION: string;
}
