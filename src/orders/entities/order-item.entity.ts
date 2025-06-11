import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  productName: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @Column('simple-json', { nullable: true })
  selectedOptions: { name: string; value: string; additionalPrice: number }[];

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;
}