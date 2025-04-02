import { Product } from "./product";

export interface CartItem {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  product: Product;
}
