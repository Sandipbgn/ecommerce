import { User } from "./dashboard";

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  orderId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    imageUrl?: string;
    price: number;
  };
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
  totalPrice: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  user?: User;
  items?: OrderItem[];
  payments?: Payment[];
//   shippingAddress?: ShippingAddress;
}
