import { PartialType } from '@nestjs/mapped-types';
import { CreateImageShareDto } from './create-image-share.dto';

export class UpdateImageShareDto extends PartialType(CreateImageShareDto) {}
