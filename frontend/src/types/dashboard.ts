export interface OrderStatusGroup {
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  _count: {
    _all: number;
  };
  _sum: {
    totalPrice: number | null;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
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
  payments?: Payment[];
}

export interface DashboardData {
  totalSales: number;
  salesByStatus: OrderStatusGroup[];
  recentOrders: Order[];
  inventory: {
    totalProducts: number;
    lowStockProducts: Product[];
  };
  topSellingProducts: [];
}
