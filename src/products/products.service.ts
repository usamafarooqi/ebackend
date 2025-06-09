import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductOption } from './entities/product-option.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductOption)
    private productOptionsRepository: Repository<ProductOption>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productsRepository.create({
        ...createProductDto,
        options: createProductDto.options
      });
      return await this.productsRepository.save(product);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create product');
    }
  }

  findAll() {
    return this.productsRepository.find({
      relations: ['options'],
    });
  }

  findOne(id: string) {
    return this.productsRepository.findOne({
      where: { id },
      relations: ['options'],
    });
  }

  async update(id: string, updateProductDto: any) {
    const { options, ...productData } = updateProductDto;
    
    // Update product
    await this.productsRepository.update(id, productData);
    
    // Update options if provided
    if (options && options.length > 0) {
      // Remove existing options
      const product = await this.findOne(id);
      if (product.options.length > 0) {
        await this.productOptionsRepository.remove(product.options);
      }
      
      // Create new options
      const productOptions = options.map(option => {
        return this.productOptionsRepository.create({
          ...option,
          product: { id },
        });
      });
      await this.productOptionsRepository.save(productOptions);
    }
    
    return this.findOne(id);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    if (product.options.length > 0) {
      await this.productOptionsRepository.remove(product.options);
    }
    return this.productsRepository.delete(id);
  }
}