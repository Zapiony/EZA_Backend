import { Controller, Get, Delete, Param } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Get()
    findAll() {
        return this.invoicesService.findAll();
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.invoicesService.remove(+id);
    }
}
