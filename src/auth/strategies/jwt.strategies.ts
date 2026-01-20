import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret', // Fallback for safety, though env should exist
        });
    }

    // ==========================================
    // MÉTODO VALIDATE: PROCESAR TOKEN VÁLIDO
    // ==========================================

    // Este método se ejecuta AUTOMÁTICAMENTE cuando:
    // 1. Se recibe un token en el header Authorization
    // 2. El token tiene una firma válida (verificada con secretOrKey)
    // 3. El token NO ha expirado (si ignoreExpiration es false)
    //
    // IMPORTANTE: Si llegamos aquí, el token YA FUE VALIDADO
    // No necesitamos verificar la firma manualmente
    //
    // Parámetro "payload": Es el contenido decodificado del token
    // Ejemplo de payload que recibiríamos:
    // {
    //   sub: 1,                    // ID del usuario (subject)
    //   email: "juan@test.com",    // Email del usuario
    //   nombre: "Juan Pérez",      // Nombre del usuario
    //   iat: 1705312200,           // Issued At: cuándo se creó el token
    //   exp: 1705398600            // Expiration: cuándo expira el token
    // }
    async validate(payload: any) {

        // Lo que retornemos aquí se adjuntará a la petición HTTP
        // Estará disponible en req.user en cualquier controlador
        //
        // Ejemplo de uso en un controlador:
        // @Get('profile')
        // getProfile(@Request() req) {
        //   console.log(req.user.userId);  // 1
        //   console.log(req.user.email);   // "juan@test.com"
        // }
        //
        // NOTA: Retornamos solo los datos necesarios, no todo el payload
        // Esto es una buena práctica de seguridad (principio de mínimo privilegio)
        return {
            userId: payload.sub,      // Mapeamos "sub" a "userId" para mayor claridad
            email: payload.email,     // Email del usuario autenticado
            role: payload.role,       // Rol del usuario (necesario para validación de permisos)
        };

        // NOTA AVANZADA: Aquí podríamos hacer validaciones adicionales:
        // - Verificar que el usuario aún existe en la base de datos
        // - Verificar que el usuario no esté bloqueado
        // - Verificar que el token no esté en una "lista negra"
        // 
        // Ejemplo:
        // const user = await this.usersService.findById(payload.sub);
        // if (!user) {
        //   throw new UnauthorizedException('Usuario no encontrado');
        // }
        // if (user.bloqueado) {
        //   throw new UnauthorizedException('Usuario bloqueado');
        // }
        // return user;
    }
}

// ============================================
// FLUJO COMPLETO DE AUTENTICACIÓN
// ============================================
//
// 1. Usuario hace login → recibe token JWT
//
// 2. Usuario hace petición a ruta protegida:
//    GET /auth/profile
//    Headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIs..." }
//
// 3. JwtAuthGuard intercepta la petición
//
// 4. Guard llama a JwtStrategy automáticamente
//
// 5. JwtStrategy:
//    a) Extrae token del header (jwtFromRequest)
//    b) Verifica firma con la clave secreta (secretOrKey)
//    c) Verifica que no haya expirado (ignoreExpiration)
//    d) Si todo OK → llama a validate() con el payload
//    e) Si algo falla → lanza error 401 Unauthorized
//
// 6. validate() retorna objeto con datos del usuario
//
// 7. Guard permite continuar, datos disponibles en req.user
//
// 8. Controlador procesa la petición con acceso a req.user
