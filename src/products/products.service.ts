import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductOption } from './entities/product-option.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductOption)
    private productOptionsRepository: Repository<ProductOption>,
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images, ...productData } = createProductDto;
      const product = this.productsRepository.create({
        ...productData,
        options: createProductDto.options
      });
      const savedProduct = await this.productsRepository.save(product);
      // Save images if provided
      if (images && images.length > 0) {
        const imageEntities = images.map(url => this.productImagesRepository.create({ url, product: savedProduct }));
        await this.productImagesRepository.save(imageEntities);
      }
      return this.findOne(savedProduct.id);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create product');
    }
  }

  findAll() {
    return this.productsRepository.find({
      relations: ['options', 'images'],
    });
  }

  findOne(id: number) {
    return this.productsRepository.findOne({
      where: { id },
      relations: ['options', 'images'],
    });
  }

  async update(id: number, updateProductDto: any) {
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

  async remove(id: number) {
    const product = await this.findOne(id);
    if (product.options.length > 0) {
      await this.productOptionsRepository.remove(product.options);
    }
    return this.productsRepository.delete(id);
  }
}