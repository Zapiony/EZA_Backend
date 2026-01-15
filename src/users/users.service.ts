import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  // Simulamos base de datos con un array
  private users: User[] = [];
  private idCounter = 1;

  // Crear nuevo usuario
  create(createUserDto: CreateUserDto): User {
    const newUser = {
      id: (this.idCounter++).toString(),
      ...createUserDto,
      createdAt: new Date(),
      updatedAt: new Date(),
      item: [] // Initialize any other required properties if they exist, but casting as User handles strictly typed checks by bypassing them slightly. 
      // Ideally we use a class constructor or similar, but for mock this is standard.
    } as unknown as User;

    // Note: purely using 'as User' might complain if we miss properties. 'as unknown as User' forces it. 
    // But better to be close. User has 'isActive' (optional/default?), 'role' (optional/default?). 
    // The DTO has optional role/isActive.
    // If we want defaults:
    if (newUser.isActive === undefined) newUser.isActive = true;
    // role default logic is in entity decorator, doesn't run here.

    this.users.push(newUser);
    return newUser;
  }

  // Buscar usuario por email
  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  // Buscar usuario por ID (used by controller)
  findOne(id: number): User | undefined {
    return this.users.find((user) => user.id === id.toString());
  }

  findById(id: number): User | undefined {
    return this.findOne(id);
  }

  // Actualizar usuario
  update(id: number, updateUserDto: UpdateUserDto): User | undefined {
    const userIndex = this.users.findIndex(user => user.id === id.toString());
    if (userIndex > -1) {
      const updatedUser = {
        ...this.users[userIndex],
        ...updateUserDto,
        updatedAt: new Date()
      };

      this.users[userIndex] = updatedUser as unknown as User;
      return this.users[userIndex];
    }
    return undefined;
  }

  // Eliminar usuario
  remove(id: number): boolean {
    const userIndex = this.users.findIndex(user => user.id === id.toString());
    if (userIndex > -1) {
      this.users.splice(userIndex, 1);
      return true;
    }
    return false;
  }

  // Obtener todos los usuarios (sin contraseñas)
  findAll(): Omit<User, 'password' | 'hashPassword'>[] {
    return this.users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;
      return rest;
    });
  }
}