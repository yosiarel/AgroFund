import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  const originalNodeEnv = process.env.NODE_ENV;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    seedAdmin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should set Authentication cookie on successful login with production security attributes (SameSite=None, Secure, HttpOnly, Partitioned)', async () => {
    process.env.NODE_ENV = 'production';

    const mockRes = {
      cookie: jest.fn(),
    } as any;

    mockAuthService.login.mockResolvedValue({ access_token: 'mock-jwt-token' });

    const result = await controller.login(
      { username: 'testuser', password: 'password123' },
      mockRes,
    );

    expect(result).toEqual({ message: 'Berhasil masuk' });
    expect(mockRes.cookie).toHaveBeenCalledWith(
      'Authentication',
      'mock-jwt-token',
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        partitioned: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    );
  });

  it('should clear Authentication cookie on logout with production security attributes', async () => {
    process.env.NODE_ENV = 'production';

    const mockRes = {
      cookie: jest.fn(),
    } as any;

    const result = await controller.logout(mockRes);

    expect(result).toEqual({ message: 'Berhasil Logout' });
    expect(mockRes.cookie).toHaveBeenCalledWith(
      'Authentication',
      '',
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        partitioned: true,
        expires: new Date(0),
      },
    );
  });
});
