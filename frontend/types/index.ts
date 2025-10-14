export interface User {
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  tvBrand: string;
  tvModel: string;
  issueType: string;
  issueDescription?: string;
  address: string;
  pickupOption: 'pickup' | 'delivery';
  status: BookingStatus;
  timeline: TimelineItem[];
  estimatedCost?: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 
  | 'pending'
  | 'under-inspection'
  | 'parts-ordered'
  | 'repair-in-progress'
  | 'ready-for-delivery'
  | 'completed'
  | 'cancelled';

export interface TimelineItem {
  status: BookingStatus;
  timestamp: string;
  note?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  stock: number;
  isInStock: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  currency: string;
  paymentMethod: 'cod';
  deliveryAddress: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Warranty {
  id: string;
  serialNumber: string;
  billNumber: string;
  productName: string;
  purchaseDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'claimed';
  userId?: string;
}
