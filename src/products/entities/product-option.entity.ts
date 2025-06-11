import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // e.g., "Size" or "Spice Level"

  @Column()
  value: string; // e.g., "Small", "Large", "Spicy", "Normal"

  @Column('decimal', { precision: 10, scale: 2 })
  additionalPrice: number; // Additional price for this option

  @ManyToOne(() => Product, (product) => product.options)
  product: Product;
}