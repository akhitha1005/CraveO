export type UserRole = 'customer' | 'restaurant' | 'delivery' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  restaurantId?: string; // If role is restaurant
  deliveryPartnerId?: string; // If role is delivery
}

export interface CustomerProfile {
  id: string;
  userId: string;
  addresses: DeliveryAddress[];
  defaultAddressId: string;
}

export interface DeliveryAddress {
  id: string;
  label: string; // e.g., 'Home', 'Work', 'Other'
  street: string;
  city: string;
  state: string;
  zipCode: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface Restaurant {
  id: string;
  userId: string;
  name: string;
  tagline: string;
  description: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  deliveryTime: string; // e.g. "25-35 mins"
  deliveryFee: number;
  minOrder: number;
  address: string;
  phone: string;
  image: string;
  coverImage?: string;
  status: 'open' | 'closed';
  isApproved: boolean;
  featured?: boolean;
  priceLevel: '$' | '$$' | '$$$';
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  isVeg: boolean;
  image: string;
  isAvailable: boolean;
  rating?: number;
  calories?: number;
  prepTimeMinutes?: number;
  featured?: boolean;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  specialInstructions?: string;
}

export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  image?: string;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress;
  restaurantId: string;
  restaurantName: string;
  restaurantPhone?: string;
  restaurantAddress?: string;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'cod';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryMinutes: number;
  cancellationReason?: string;
  reviewSubmitted?: boolean;
}

export interface DeliveryPartner {
  id: string;
  userId: string;
  name: string;
  phone: string;
  vehicleType: 'Bike' | 'Scooter' | 'Bicycle' | 'Car';
  vehiclePlate: string;
  activeStatus: 'available' | 'delivering' | 'offline';
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  currentOrderId?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetType: 'restaurant' | 'delivery';
  targetId: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  orderId?: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
  resolutionNotes?: string;
}
