import { IsString, IsNotEmpty, MaxLength, IsEmail } from 'class-validator';

export class CreateClientDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(13)
    CLI_CEDULA_RUC: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    CLI_NOMBRE: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    CLI_TELEFONO: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    @IsEmail()
    CLI_CORREO: string;
}
