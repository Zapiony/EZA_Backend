import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
    constructor(
        @InjectRepository(Client, 'PUBLIC_DB')
        private readonly clientRepository: Repository<Client>,
        @InjectRepository(Client)
        private readonly clientPrivateRepository: Repository<Client>,
    ) { }

    async create(createClientDto: CreateClientDto): Promise<Client> {
        const client = this.clientPrivateRepository.create(createClientDto);
        return await this.clientPrivateRepository.save(client);
    }

    async findAll(): Promise<Client[]> {
        return await this.clientRepository.find();
    }

    async findOne(CLI_CEDULA_RUC: string): Promise<Client> {
        const client = await this.clientRepository.findOne({ where: { CLI_CEDULA_RUC } });
        if (!client) {
            throw new NotFoundException(`Client with identification ${CLI_CEDULA_RUC} not found`);
        }
        return client;
    }

    async update(CLI_CEDULA_RUC: string, updateClientDto: UpdateClientDto): Promise<Client> {
        const client = await this.findOne(CLI_CEDULA_RUC);
        this.clientRepository.merge(client, updateClientDto);
        return await this.clientRepository.save(client);
    }

    async remove(CLI_CEDULA_RUC: string): Promise<void> {
        const result = await this.clientRepository.delete(CLI_CEDULA_RUC);
        if (result.affected === 0) {
            throw new NotFoundException(`Client with identification ${CLI_CEDULA_RUC} not found`);
        }
    }
}
