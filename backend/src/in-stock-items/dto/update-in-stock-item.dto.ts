import { PartialType } from '@nestjs/mapped-types';
import { CreateInStockItemDto } from './create-in-stock-item.dto';

export class UpdateInStockItemDto extends PartialType(CreateInStockItemDto) {}
