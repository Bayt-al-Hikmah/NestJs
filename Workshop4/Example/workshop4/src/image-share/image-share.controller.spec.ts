import { Test, TestingModule } from '@nestjs/testing';
import { ImageShareController } from './image-share.controller';
import { ImageShareService } from './image-share.service';

describe('ImageShareController', () => {
  let controller: ImageShareController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageShareController],
      providers: [ImageShareService],
    }).compile();

    controller = module.get<ImageShareController>(ImageShareController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
