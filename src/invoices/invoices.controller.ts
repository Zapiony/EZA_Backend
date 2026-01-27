import { Controller, Get, Delete, Param, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Roles(UserRole.ADMIN, UserRole.VENTAS, UserRole.MARKETING)
    @Get()
    findAll() {
        return this.invoicesService.findAll();
    }

    @Roles(UserRole.ADMIN, UserRole.VENTAS, UserRole.MARKETING)
    @Get('stats/monthly')
    async getMonthlyStats() {
        return this.invoicesService.getMonthlySales();
    }

    @Roles(UserRole.ADMIN, UserRole.VENTAS)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.invoicesService.remove(+id);
    }

    @Roles(UserRole.ADMIN, UserRole.CLIENT, UserRole.VENTAS)
    @Get(':id/pdf')
    async downloadPdf(@Param('id') id: string, @Res() res: Response) {
        const buffer = await this.invoicesService.generatePdf(+id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=factura-${id}.pdf`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }
}
