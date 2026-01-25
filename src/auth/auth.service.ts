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
        // 1. Intentar buscar en tabla USUARIO (Clientes)
        const user = await this.usersService.findByUsername(loginDto.username);

        if (user) {
            // Existe como cliente, verificar contraseña
            let isMatch = await bcrypt.compare(loginDto.password, user.password);

            // Fallback: Check plain text if hash match failed
            if (!isMatch && loginDto.password === user.password) {
                isMatch = true;
            }

            if (isMatch) {
                const payload = { sub: user.id, username: user.name, role: UserRole.CLIENT };
                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        name: user.name,
                        role: UserRole.CLIENT
                    }
                };
            }
            // Si el usuario existe pero la clave es incorrecta, devolvemos error (no intentamos admin)
            throw new UnauthorizedException('Usuario o clave incorrecto');
        }

        try {
            return await this.loginAsAdmin(loginDto);
        } catch (error) {
            // Si falla la conexión como admin, entonces credenciales inválidas
            throw new UnauthorizedException('Usuario o clave incorrecto');
        }
    }

    private async loginAsAdmin(loginDto: LoginDto) {
        let connection;
        try {
            connection = await oracledb.getConnection({
                user: loginDto.username,
                password: loginDto.password,
                connectString: this.configService.get('DB_CONNECT_STRING')
            });

            const payload = {
                sub: 'admin',
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
            throw new UnauthorizedException('Usuario o clave incorrecto');
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
        // Si el userId es 'admin' o no es un número válido (ej. token antiguo o inválido),
        // asumimos que es un admin o retornamos el perfil de admin para evitar crash por NaN en Oracle.
        if (userId === 'admin') {
            return { role: UserRole.ADMIN, name: 'Administrator' };
        }

        const user = await this.usersService.findById(userId);
        if (!user) return null;

        const { password, ...rest } = user;
        const client = await this.clientsService.findOne(user.cedula);

        return {
            ...rest,
            email: client?.CLI_CORREO
        };
    }
}
