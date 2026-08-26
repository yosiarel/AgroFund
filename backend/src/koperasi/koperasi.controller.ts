import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { KoperasiService } from './koperasi.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { BuyItemDto } from './dto/buy-item.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('koperasi')
@Controller('koperasi')
export class KoperasiController {
  constructor(private readonly koperasiService: KoperasiService) {}

  @Get('items')
  @ApiOperation({ summary: 'Get all available items' })
  getItems() {
    return this.koperasiService.getItems();
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order history' })
  getOrders(@Request() req: any) {
    return this.koperasiService.getOrders(req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('items')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new item (Admin only)' })
  createItem(@Body() dto: CreateItemDto) {
    return this.koperasiService.createItem(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('items/:id') // Using POST or PUT, let's stick to PUT
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an item (Admin only)' })
  updateItem(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.koperasiService.updateItem(id, dto);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('items/:id/delete') // Or DELETE method
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an item (Admin only)' })
  deleteItem(@Param('id') id: string) {
    return this.koperasiService.deleteItem(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.UMKM)
  @Post('buy/:itemId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exchange balance for an item (UMKM only)' })
  buyItem(@Request() req: any, @Param('itemId') itemId: string, @Body() dto: BuyItemDto) {
    return this.koperasiService.buyItem(req.user.userId, itemId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('orders/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.koperasiService.updateOrderStatus(id, body.status);
  }
}
