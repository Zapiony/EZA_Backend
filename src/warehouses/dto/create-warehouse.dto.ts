import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateWarehouseDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(6)
    BOD_CODIGO: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    BOD_DESCRIPCION: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    BOD_DIRECCION: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    BOD_NOMBRE_ENCARGADO: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    BOD_TELEFONO_ENCARGADO: string;
}
