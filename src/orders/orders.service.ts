import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private productsService: ProductsService,
  ) {}

  async create(createOrderDto: any, userId: number) {
    const { items, ...orderData } = createOrderDto;
    
    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await this.productsService.findOne(item.productId);
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }
      
      let itemPrice = Number(product.price);
      const selectedOptions = [];
      
      // Calculate additional price from selected options
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        for (const selectedOption of item.selectedOptions) {
          const productOption = product.options.find(
            option => option.name === selectedOption.name && option.value === selectedOption.value
          );
          
          if (productOption) {
            itemPrice += Number(productOption.additionalPrice);
            console.log(productOption);
            selectedOptions.push({
              name: productOption.name,
              value: productOption.value,
              additionalPrice: productOption.additionalPrice,
            });
          }
        }
      }
      
      const orderItem = this.orderItemsRepository.create({
        productId: product.id,
        productName: product.name,
        price: itemPrice,
        quantity: item.quantity,
        selectedOptions,
      });
      
      orderItems.push(orderItem);
      totalAmount += itemPrice * item.quantity;
    }
    
    // Create order
    const order = this.ordersRepository.create({
      ...orderData,
      totalAmount,
      user: { id: userId },
      status: OrderStatus.PENDING,
    });
    
    const result = await this.ordersRepository.save(order);
    // Save order items
    for (const item of orderItems) {
      item.order = result;
      await this.orderItemsRepository.save(item);
    }
    
    return result
  }

  findAll(userId?: number) {
    const options: any = {
      relations: ['items', 'user'],
    };
    
    if (userId) {
      options.where = { user: { id: userId } };
    }
    
    return this.ordersRepository.find(options);
  }

  findOne(id: number) {
    return this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'user'],
    });
  }

  async update(id: number, updateOrderDto: any) {
    await this.ordersRepository.update(id, updateOrderDto);
    return this.findOne(id);
  }

  async updateStatus(id: number, status: OrderStatus) {
    await this.ordersRepository.update(id, { status });
    return this.findOne(id);
  }

  remove(id: number) {
    return this.ordersRepository.delete(id);
  }
}