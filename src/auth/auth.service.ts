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
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private clientsService: ClientsService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { password, identification, username, name, email, telephone } = registerDto;

        // Validar si el usuario ya existe (por nombre de usuario de login)
        const existingUser = await this.usersService.findByUsername(username);
        if (existingUser) {
            throw new ConflictException('Username already taken');
        }

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
        const newUser = await this.usersService.create({
            username: identification,
            name: username,
            password: hashedPassword,
            email: email,
            role: UserRole.CLIENT,
            isActive: true,
        });

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

            // 3. Query User Role
            let role = UserRole.ADMIN; // Default fallback
            try {
                // Check SESSION_ROLES since we are connected as that user
                const result = await connection.execute(
                    `SELECT ROLE FROM SESSION_ROLES 
                     WHERE ROLE IN ('ROL_BODEGUERO', 'ROL_VENTAS', 'ROL_MARKETING', 'ROL_COMPRAS')`
                );

                if (result.rows && result.rows.length > 0) {
                    // Extract the first matching role found
                    const dbRole = result.rows[0][0]; // result.rows is array of arrays [[VAL]]
                    role = dbRole as any; // Cast or map if you have specific enum values
                }
            } catch (roleErr) {
                console.warn('Could not determine specific role, defaulting to ADMIN', roleErr);
            }

            const payload = {
                sub: 'admin', // Or use loginDto.username as ID
                username: loginDto.username,
                role: role
            };

            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    name: loginDto.username,
                    role: role
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
