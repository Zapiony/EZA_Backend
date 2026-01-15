import {
    Injectable,
    ConflictException,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    /**
     * REGISTRO DE USUARIO
     * 1. Verifica que el email no exista
     * 2. Hashea la contraseña
     * 3. Crea el usuario
     * 4. Retorna usuario sin contraseña
     * 5. algo mas? esta bien este algoritmo?
     */
    async register(registerDto: RegisterDto) {
        const { password, ...userData } = registerDto;

        const existingUser = this.usersService.findByEmail(userData.email);
        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = this.usersService.create({
            ...userData,
            password: hashedPassword,
            role: UserRole.CLIENT,
            isActive: true,
        });

        const { password: _, ...result } = newUser;
        return result;
    }

    /**
     * LOGIN DE USUARIO
     * 1. Busca usuario por email
     * 2. Verifica contraseña
     * 3. Genera token JWT
     */
    async login(loginDto: LoginDto) {
        const user = this.usersService.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const isMatch = await bcrypt.compare(loginDto.password, user.password);

        if (!isMatch) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };
    }

    /**
     * OBTENER PERFIL
     * Retorna información del usuario autenticado
     */
    getProfile(userId: number) {
        const user = this.usersService.findById(userId);
        if (!user) return null;

        const { password, ...rest } = user;
        return rest;
    }
}
