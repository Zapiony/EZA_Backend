import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'PUBLIC_DB')
    private readonly userRepository: Repository<User>,
    @InjectRepository(User)
    private readonly userPrivateRepository: Repository<User>,
  ) { }

  // Crear nuevo usuario (Cliente)
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Map DTO to Entity fields
    const newUser = this.userPrivateRepository.create({
      cedula: createUserDto.username,
      name: createUserDto.name,
      password: createUserDto.password,
    });
    return await this.userPrivateRepository.save(newUser);
  }

  // Buscar usuario por USU_NOMBRE (Login)
  async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { name: username },
      select: ['id', 'cedula', 'name', 'password']
    });
    if (user) {
      user.role = UserRole.CLIENT;
    }
    return user || undefined;
  }

  // Buscar usuario por ID
  async findOne(id: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) user.role = UserRole.CLIENT;
    return user || undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.findOne(id);
  }

  // Actualizar usuario
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | undefined> {
    const user = await this.findOne(id);
    if (!user) return undefined;
    if (updateUserDto.name) user.name = updateUserDto.name;

    return await this.userRepository.save(user);
  }

  // Eliminar usuario
  async remove(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  // Obtener todos los usuarios
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find();
    return users.map((user) => {
      user.role = UserRole.CLIENT;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;
      return rest;
    });
  }
}