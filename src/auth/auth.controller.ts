import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.authService.getProfile(req.user.userId) as any;
    if (!user) {
      return { message: 'Usuario no encontrado' };
    }
    // Si el perfil devuelve un rol genérico (como admin), preferimos el del token
    const effectiveRole = req.user.role || user.role;

    return {
      message: 'Perfil obtenido exitosamente',
      user: {
        ...user,
        role: effectiveRole,
        cedula: user.cedula,
        userId: user.id,
        correo: user.correo
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('validation')
  async validateSession(@Request() req) {
    // Endpoint ligero para validar sesión y obtener ID crítico
    const user = await this.authService.getProfile(req.user.userId) as any;
    if (!user) {
      return { valid: false };
    }
    return {
      valid: true,
      userId: user.id || req.user.userId,
      cedula: user.cedula || user.CLI_CEDULA_RUC,
      role: req.user.role || user.role
    };
  }

  /**
   * GET /auth/protected
   * Ejemplo de ruta protegida
   * Ruta PROTEGIDA - requiere token válido
   */
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  protectedRoute(@Request() req) {
    return {
      message: `¡Hola ${req.user.name}! Esta es una ruta protegida.`,
      timestamp: new Date().toISOString(),
      userId: req.user.id,
    };
  }
}
