import { Test, TestingModule } from '@nestjs/testing';
import { KoperasiController } from './koperasi.controller';
import { KoperasiService } from './koperasi.service';

describe('KoperasiController', () => {
  let controller: KoperasiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KoperasiController],
      providers: [{ provide: KoperasiService, useValue: {} }],
    }).compile();

    controller = module.get<KoperasiController>(KoperasiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
