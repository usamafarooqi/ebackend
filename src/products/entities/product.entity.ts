import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductOption } from './product-option.entity';
import { ProductImage } from './product-image.entity';


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

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @OneToMany(() => ProductOption, (option) => option.product, { cascade: true })
  options: ProductOption[];
}