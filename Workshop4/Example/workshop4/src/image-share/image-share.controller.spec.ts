import { Test, TestingModule } from '@nestjs/testing';
import { ImageShareController } from './image-share.controller';

describe('ImageShareController', () => {
  let controller: ImageShareController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageShareController],
    }).compile();

    controller = module.get<ImageShareController>(ImageShareController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
