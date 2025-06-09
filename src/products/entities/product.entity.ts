import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductOption } from './product-option.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  imageUrl: string;

  @OneToMany(() => ProductOption, (option) => option.product, { cascade: true })
  options: ProductOption[];
}