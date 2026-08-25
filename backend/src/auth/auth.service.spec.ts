import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register()', () => {
    it('harus menolak jika username sudah terdaftar', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({ id: '1', username: 'testuser' });

      await expect(service.register({
        username: 'testuser',
        password: 'password',
        name: 'Test',
        role: Role.UMKM,
        phone: '08111',
        address: 'Test',
      })).rejects.toThrow(BadRequestException);
    });

    it('harus membuat user baru dan menghash password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.user.create.mockResolvedValueOnce({ id: '2' });
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed-password');

      const result = await service.register({
        username: 'newuser',
        password: 'password',
        name: 'Test',
        role: Role.UMKM,
        phone: '08111',
        address: 'Test',
      });

      expect(result).toEqual({ message: 'Pendaftaran berhasil', userId: '2' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ password: 'hashed-password' }),
        }),
      );
    });
  });

  describe('login()', () => {
    it('harus menolak jika username tidak ditemukan', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.login({ username: 'test', password: 'pwd' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('harus menolak jika password salah', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: '1',
        username: 'test',
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.login({ username: 'test', password: 'wrong-pwd' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('harus mengembalikan JWT token jika login sukses', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: '1',
        username: 'test',
        password: 'hashed-password',
        role: Role.UMKM,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockJwtService.sign.mockReturnValue('valid-jwt-token');

      const result = await service.login({ username: 'test', password: 'correct-pwd' });

      expect(result).toEqual({ access_token: 'valid-jwt-token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ username: 'test', sub: '1', role: Role.UMKM });
    });
  });
});
