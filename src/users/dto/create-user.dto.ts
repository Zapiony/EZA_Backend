import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    username: string;
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    isActive?: boolean;
}
