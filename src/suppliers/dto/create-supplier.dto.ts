import { IsString, IsNotEmpty, MaxLength, IsEmail, IsOptional } from 'class-validator';

export class CreateSupplierDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(13)
    PRV_RUC: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    PRV_DIRECCION: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    PRV_TELEFONO: string;

    @IsString()
    @IsOptional()
    @MaxLength(60)
    PRV_RAZON_SOCIAL: string;

    @IsString()
    @IsOptional() // Made optional based on common DB patterns, strict if required
    @MaxLength(60)
    @IsEmail()
    PRV_CORREO: string;
}
