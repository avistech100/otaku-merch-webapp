// Extended database types for Otaku Merch

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'creator_pending' | 'creator' | 'admin';
  bio: string | null;
  website: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  discord_handle: string | null;
  wallet_address: string | null;
  followers_count: number;
  following_count: number;
  
  // Creator-specific fields
  store_name: string | null;
  store_description: string | null;
  store_logo_url: string | null;
  store_banner_url: string | null;
  social_links: Record<string, string>;
  contact_email: string | null;
  commission_rate: number;
  wallet_balance: number;
  pending_balance: number;
  total_earnings: number;
  is_verified: boolean;
  verification_date: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  shipping_fee?: number; // Alias
  total: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string | null;
  payment_reference: string | null;
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  customer_notes: string | null;
  customer_note?: string; // Alias
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  creator_id: string;
  product_title: string;
  product_image: string | null;
  variant: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  commission_rate: number;
  creator_earnings: number;
  platform_fee: number;
  created_at: string;
}

export interface Payout {
  id: string;
  creator_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  payment_details: Record<string, any> | null;
  request_date: string;
  processed_date: string | null;
  processed_by: string | null;
  notes: string | null;
  admin_notes: string | null;
  transaction_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  action_url: string | null;
  action_label: string | null;
  is_read: boolean;
  read: boolean; // Alias
  read_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  creator_reply: string | null;
  reply_date: string | null;
  is_verified_purchase: boolean;
  is_flagged: boolean;
  flag_reason: string | null;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  order_id: string | null;
  subject: string;
  body: string;
  parent_id: string | null;
  thread_id: string | null;
  is_read: boolean;
  read_at: string | null;
  is_archived: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  description: string | null;
  changes: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: Record<string, any>;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  type: 'billing' | 'shipping';
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  zip: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Dashboard stats types
export interface CreatorStats {
  totalSales: number;
  activeOrders: number;
  totalProducts: number;
  views: number;
  conversionRate: number;
  pendingBalance: number;
  availableBalance: number;
}

export interface AdminStats {
  totalUsers: number;
  pendingCreators: number;
  pendingProducts: number;
  totalRevenue: number;
  activeOrders: number;
  completedOrders: number;
}
