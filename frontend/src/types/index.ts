// Create this in a new file: src/types/index.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Payment {
  id: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: Address;
  paymentMethod: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  payments?: Payment[];
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
