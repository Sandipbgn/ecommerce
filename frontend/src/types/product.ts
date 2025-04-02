export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductsResponse {
  message: string;
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ProductResponse {
  message: string;
  data: Product;
}
