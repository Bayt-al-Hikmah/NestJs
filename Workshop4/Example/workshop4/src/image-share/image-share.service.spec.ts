import { Test, TestingModule } from '@nestjs/testing';
import { ImageShareService } from './image-share.service';

describe('ImageShareService', () => {
  let service: ImageShareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageShareService],
    }).compile();

    service = module.get<ImageShareService>(ImageShareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
