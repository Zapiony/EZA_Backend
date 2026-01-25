import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            // If no roles are required, allow access (or default to denied? usually allow unless specified)
            // But we usually combine this with JwtAuthGuard.
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        // If no user attached (e.g. public route without JwtAuthGuard), decide policy.
        // If route has @Roles, it implies it's protected, so user must exist.
        if (!user) {
            return false;
        }

        // Admin has access to everything? Or strictly checked?
        // User requested: "Private DB only Admins".
        // So strict check is good.
        // However, usually Admin implies superuser.
        // Let's check exact match.

        return requiredRoles.some((role) => user.role === role);
    }
}
