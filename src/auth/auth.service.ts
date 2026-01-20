import {
    Injectable,
    ConflictException,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as oracledb from 'oracledb';
import { ShoppingCartService } from '../shopping-cart/shopping-cart.service';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private shoppingCartService: ShoppingCartService,
        private clientsService: ClientsService,
    ) { }

    // ...

    async register(registerDto: RegisterDto) {
        // Correct logic:
        // identification -> CLI_CEDULA_RUC (Client PK, User FK)
        // username -> USU_NOMBRE (User Display Name / Account Name)
        // name -> CLI_NOMBRE (Client Real Name)

        const { password, identification, username, name, email, telephone } = registerDto;

        // Validar si el usuario ya existe (por nombre de usuario de login)
        const existingUser = await this.usersService.findByUsername(username);
        if (existingUser) {
            throw new ConflictException('Username already taken');
        }

        // También validar si ya existe un usuario con esa cédula
        // (Esto dependerá de si UsersService tiene un método para esto, por ahora findByUsername busca por USU_NOMBRE)
        // Pero intentaremos insertar y si falla la constraint unique saltará.
        // Opcional: Buscar user por cedula si `usersService` lo soporta.

        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Ensure Client exists
        try {
            await this.clientsService.findOne(identification);
        } catch (error) {
            if (error.status === 404 || error.message.includes('not found')) {
                await this.clientsService.create({
                    CLI_CEDULA_RUC: identification,
                    CLI_NOMBRE: name, // Full Name for Client
                    CLI_TELEFONO: telephone || '0000000000',
                    CLI_CORREO: email
                });
            } else {
                throw error;
            }
        }

        // 2. Create User
        // Note: UsersService.create currently takes "username" and maps it to "cedula".
        // We need to fix UsersService.create logic too, or conform to it.
        // Assuming UsersService.create(dto) maps: dto.username -> entity.cedula, dto.name -> entity.name
        // So we pass:
        // username: identification (so it maps to cedula)
        // name: username (so it maps to USU_NOMBRE)

        const newUser = await this.usersService.create({
            username: identification, // Turns into CLI_CEDULA_RUC in UsersService
            name: username,          // Turns into USU_NOMBRE in UsersService
            password: hashedPassword,
            email: email, // Not used in Entity but passed to create DTO
            role: UserRole.CLIENT,
            isActive: true,
        });

        // Create Shopping Cart using identification (which is the user ID/Cedula)
        if (newUser.cedula) {
            try {
                await this.shoppingCartService.createCartForUser(newUser.cedula);
            } catch (error) {
                console.error('Error creating cart for user:', error);
            }
        }

        const { password: _, ...result } = newUser;
        return result;
    }

    /**
     * LOGIN DE USUARIO
     * Soporta:
     * 1. Clientes (Tabla USUARIO -> USU_NOMBRE)
     * 2. Admins (Oracle DB Users)
     */
    async login(loginDto: LoginDto) {
        // --- ESTRATEGIA 1: ADMIN (DBA_USERS) ---
        if (loginDto.isAdmin) {
            return this.loginAsAdmin(loginDto);
        }

        // --- ESTRATEGIA 2: CLIENTE (TABLA USUARIO) ---
        const user = await this.usersService.findByUsername(loginDto.username);

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas (Usuario no encontrado)');
        }

        let isMatch = await bcrypt.compare(loginDto.password, user.password || '');

        // Fallback: Check plain text if hash match failed (for manually inserted users)
        if (!isMatch && loginDto.password === user.password) {
            isMatch = true;
        }

        if (!isMatch) {
            throw new UnauthorizedException('Credenciales inválidas (Contraseña incorrecta)');
        }

        // Payload uses username (USU_NOMBRE). Use 0 or name as sub if ID not present.
        const payload = { sub: user.id || 0, username: user.name, role: UserRole.CLIENT };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                // Return only minimal info as requested
                name: user.name, // USU_NOMBRE
                role: UserRole.CLIENT
            }
        };
    }

    private async loginAsAdmin(loginDto: LoginDto) {
        let connection;
        try {
            // Intentar conectar a Oracle directamente con las credenciales
            connection = await oracledb.getConnection({
                user: loginDto.username, // El usuario DB (ej: SYSTEM)
                password: loginDto.password,
                connectString: this.configService.get('DB_CONNECT_STRING')
            });

            // Si conecta, es válido.
            // Generamos token de ADMIN
            const payload = {
                sub: 'admin', // No tenemos ID numérico fijo
                username: loginDto.username,
                role: UserRole.ADMIN
            };

            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    name: loginDto.username,
                    role: UserRole.ADMIN
                }
            };

        } catch (err) {
            console.error('Admin Login Error:', err);
            throw new UnauthorizedException('Credenciales de Administrador inválidas');
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    /**
     * OBTENER PERFIL
     */
    async getProfile(userId: any) {
        // Si userId es 'admin' o string generico, devolver info admin manual
        if (userId === 'admin' || typeof userId === 'string' && isNaN(Number(userId))) {
            return { role: UserRole.ADMIN, name: 'Administrator' };
        }

        // Si es número, buscar en tabla usuarios
        const user = await this.usersService.findById(Number(userId));
        if (!user) return null;

        const { password, ...rest } = user;
        return rest;
    }
}
