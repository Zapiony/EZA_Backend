import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  // Crear nuevo usuario (Cliente)
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Map DTO to Entity fields
    const newUser = this.userRepository.create({
      cedula: createUserDto.username, // Assuming username holds cedula in DTO or update DTO
      name: createUserDto.name,
      password: createUserDto.password,
      // Role is default CLIENT
    });
    return await this.userRepository.save(newUser);
  }

  // Buscar usuario por USU_NOMBRE (Login)
  async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { name: username }, // name maps to USU_NOMBRE
      // Select only name and password as requested (avoiding cedula/id if possible)
      // Note: Primary Key (id) might still be selected by TypeORM implicitly.
      select: ['name', 'password']
    });
    // Manually assign implicit role for the app logic
    if (user) {
      user.role = UserRole.CLIENT;
    }
    return user || undefined;
  }

  // Buscar usuario por ID
  async findOne(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) user.role = UserRole.CLIENT;
    return user || undefined;
  }

  async findById(id: number): Promise<User | undefined> {
    return this.findOne(id);
  }

  // Actualizar usuario
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | undefined> {
    const user = await this.findOne(id);
    if (!user) return undefined;

    // Mapping updates... currently DTO has old names
    // This part might need more robust DTO mapping but for now:
    if (updateUserDto.name) user.name = updateUserDto.name;
    // ...handle other fields

    return await this.userRepository.save(user);
  }

  // Eliminar usuario
  async remove(id: number): Promise<boolean> {
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