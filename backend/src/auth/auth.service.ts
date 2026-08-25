import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existingUser) {
      throw new BadRequestException('Username sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        name: dto.name,
        role: dto.role,
        phone: dto.phone,
        address: dto.address,
        wallet: {
          create: {
            balance: 0,
            hold: 0,
          },
        },
      },
    });

    return { message: 'Pendaftaran berhasil', userId: user.id };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async seedAdmin() {
    const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (admin) return { message: 'Admin already exists' };

    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@AkarMakmur2026!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const newAdmin = await this.prisma.user.create({
      data: {
        name: 'Super Admin',
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
        wallet: { create: { balance: 0, hold: 0 } }
      }
    });
    return { message: 'Admin created successfully', username: newAdmin.username };
  }
}
