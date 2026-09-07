import { Test, TestingModule } from '@nestjs/testing';
import { ProcurementService } from './procurement.service';

import { PrismaService } from '../prisma/prisma.service';

describe('ProcurementService', () => {
  let service: ProcurementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcurementService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<ProcurementService>(ProcurementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
