import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BuyItemDto } from './dto/buy-item.dto';
import { TransactionType } from '@prisma/client';

@Injectable()
export class KoperasiService {
  constructor(private prisma: PrismaService) { }

  async getItems() {
    return this.prisma.item.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createItem(dto: any) {
    return this.prisma.item.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: BigInt(dto.price),
        stock: dto.stock,
        imageUrl: dto.imageUrl,
        category: dto.category
      }
    });
  }

  async updateItem(id: string, dto: any) {
    const data: any = { ...dto };
    if (dto.price !== undefined) data.price = BigInt(dto.price);

    return this.prisma.item.update({
      where: { id },
      data
    });
  }

  async deleteItem(id: string) {
    const orders = await this.prisma.order.findFirst({ where: { itemId: id } });
    if (orders) {
      throw new BadRequestException('Barang tidak dapat dihapus karena sudah ada pesanan dari pengguna');
    }

    return this.prisma.item.delete({
      where: { id }
    });
  }

  async getOrders(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.order.findMany({
        include: { item: true, user: { select: { name: true, username: true } } },
        orderBy: { createdAt: 'desc' }
      });
    }

    return this.prisma.order.findMany({
      where: { userId },
      include: { item: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async buyItem(userId: string, itemId: string, dto: BuyItemDto) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (!item) throw new NotFoundException('Barang tidak ditemukan');
      if (item.stock < dto.quantity) throw new BadRequestException('Stok barang tidak mencukupi');

      const totalPrice = item.price * BigInt(dto.quantity);

      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < totalPrice) {
        throw new BadRequestException('Saldo tidak mencukupi untuk membeli barang ini');
      }

      await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: totalPrice } }
      });

      await tx.item.update({
        where: { id: itemId },
        data: { stock: { decrement: dto.quantity } }
      });
      const order = await tx.order.create({
        data: {
          userId,
          itemId,
          quantity: dto.quantity,
          totalPrice,
          status: 'PENDING'
        }
      });

      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.EXCHANGE,
          amount: totalPrice,
          referenceId: order.id
        }
      });

      return order;
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    const validStatuses = ['PENDING', 'PROCESSED', 'SHIPPED', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Status tidak valid');
    }

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
  }

  async onModuleInit() {
    const count = await this.prisma.item.count();
    if (count === 0) {
      console.log('Seeding initial Koperasi items...');
      await this.prisma.item.createMany({
        data: [
          {
            name: 'Pupuk Urea 50kg',
            description: 'Pupuk berkualitas tinggi untuk menyuburkan tanah dan mempercepat pertumbuhan tanaman.',
            price: 250000n,
            stock: 100,
            category: 'Pupuk',
            imageUrl: 'https://res.cloudinary.com/dwyx971u2/image/upload/v1721528645/pupuk-urea.png'
          },
          {
            name: 'Bibit Padi Unggul 5kg',
            description: 'Bibit padi varietas unggul tahan hama dan penyakit.',
            price: 75000n,
            stock: 50,
            category: 'Bibit',
            imageUrl: 'https://res.cloudinary.com/dwyx971u2/image/upload/v1721528645/bibit-padi.png'
          },
          {
            name: 'Traktor Mini Rotary',
            description: 'Traktor mini untuk membajak sawah dan ladang dengan efisien.',
            price: 15000000n,
            stock: 5,
            category: 'Alat Berat',
            imageUrl: 'https://res.cloudinary.com/dwyx971u2/image/upload/v1721528645/traktor-mini.png'
          }
        ]
      });
      console.log('Seeding completed.');
    }
  }
}
