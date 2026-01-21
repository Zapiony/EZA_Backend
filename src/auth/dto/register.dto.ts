import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsString()
    identification: string;

    @IsString()
    username: string;

    @IsString()
    name: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsOptional()
    telephone: string;
}
