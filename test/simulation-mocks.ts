
import { Controller, Post, Body, BadRequestException, UnauthorizedException, Get, UseGuards, Request, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport'; // Or use a mock guard if needed

export interface SimUser {
    id: number;
    cedula: string;
    name: string;
    email: string; // "Correo"
    password: string;
    role: string;
}

@Injectable()
export class SimulationAuthService {
    private users: SimUser[] = [];
    private idCounter = 1;

    constructor(private jwtService: JwtService) { }

    async register(body: any) {
        const { name, email, password, confirmPassword } = body;

        if (password !== confirmPassword) {
            throw new BadRequestException('Las contraseñas no coinciden');
        }

        if (this.users.find(u => u.email === email)) {
            throw new BadRequestException('El correo ya está registrado');
        }

        // Generate Cedula/Username from email/name for internal consistency
        const newUser: SimUser = {
            id: this.idCounter++,
            cedula: email, // Use email as ID for simulation
            name: name,
            email: email,
            password: password, // Store plain text for simulation simplicity or hash if needed
            role: 'client'
        };

        this.users.push(newUser);

        // Return result similar to real backend
        const { password: _, ...result } = newUser;
        return result;
    }

    async login(body: any) {
        const { username, password } = body;
        // Note: The real frontend might send "username" field but user enters email. 
        // We'll check against email or cedula or name.

        const user = this.users.find(u => u.email === username || u.name === username || u.cedula === username);

        if (!user || user.password !== password) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload = { sub: user.id, username: user.name, role: user.role };
        let token = 'mock-token';
        try {
            if (this.jwtService) {
                token = this.jwtService.sign(payload);
            } else {
                console.warn('JwtService not available, using mock token');
                // Embed User ID in mock token so we can retrieve it later
                token = 'mock-token-' + user.id;
            }
        } catch (e) {
            console.error('Error signing token:', e);
            token = 'ey-error-token';
        }

        return {
            access_token: token,
            user: {
                name: user.name,
                role: user.role,
                email: user.email
            }
        };
    }

    async getProfile(userId: number) {
        const user = this.users.find(u => u.id === Number(userId));
        if (!user) return null;
        const { password, ...rest } = user;

        return {
            ...rest,
            client: {
                CLI_CEDULA_RUC: user.cedula,
                CLI_NOMBRE: user.name,
                CLI_CORREO: user.email,
                CLI_TELEFONO: '0999999999' // Mock phone
            }
        };
    }
}

@Controller('auth')
export class SimulationAuthController {
    constructor(private readonly authService: SimulationAuthService) { }

    @Post('register')
    register(@Body() body: any) {
        return this.authService.register(body);
    }

    @Post('login')
    login(@Body() body: any) {
        return this.authService.login(body);
    }

    @Get('profile')
    async getProfile(@Request() req) {
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new UnauthorizedException('No token provided');

        const token = authHeader.split(' ')[1];
        let userId: number | null = null;

        if (token.startsWith('mock-token-')) {
            // Extract ID from mock token
            const idPart = token.split('mock-token-')[1];
            userId = Number(idPart);
        } else {
            // Try decode standard JWT manually (without library)
            try {
                const base64Url = token.split('.')[1];
                if (base64Url) {
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
                    const payload = JSON.parse(jsonPayload);
                    userId = payload.sub;
                }
            } catch (e) {
                console.error('Error decoding JWT internally:', e);
            }
        }

        if (!userId) {
            console.warn('Could not extract userId from token:', token);
            throw new UnauthorizedException('Invalid Token');
        }

        return this.authService.getProfile(userId);
    }
}
