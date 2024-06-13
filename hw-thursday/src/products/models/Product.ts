import mongoose, { Document } from 'mongoose';

interface IProduct extends Document {
  id: string;
  item_group_id: string;
  mpn: string;
  title: string;
  description: string;
  image_link: string;
  additional_image_link: string;
  url: string;
  gender: string;
  age_group: string;
  brand: string;
  color: string;
  size: string;
  availability: string;
  price: string;
  condition: string;
  product_type: string;
  google_product_category: number;
}

const productSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  item_group_id: String,
  mpn: String,
  title: String,
  description: String,
  image_link: String,
  additional_image_link: String,
  url: { type: String, unique: true, required: true },
  gender: String,
  age_group: String,
  brand: String,
  color: String,
  size: String,
  availability: String,
  price: String,
  condition: String,
  product_type: String,
  google_product_category: Number
});

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;
