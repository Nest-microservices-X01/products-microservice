import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll({ page, limit }: PaginationDto) {
    const productsCount = await this.product.count({
      where: { available: true },
    });
    const lastPage = Math.ceil(productsCount / limit);

    return {
      data: await this.product.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      metadata: {
        page,
        count: productsCount,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id, available: true },
    });
    if (!product)
      throw new NotFoundException(`Product with id #${id} not found`);
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: __, ...data } = updateProductDto;

    await this.findOne(id);

    return this.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // return this.product.delete({ where: { id } });

    const product = await this.product.update({
      where: { id },
      data: { available: false },
    });

    return product;
  }
}
