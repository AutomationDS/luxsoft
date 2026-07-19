export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  icon: string;
  display_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number;
  category_id: number;
  image_url: string;
  images: string;
  brand: string;
  rating: number;
  review_count: number;
  stock: number;
  is_featured: boolean;
  is_trending: boolean;
  colors: string;
  sizes: string;
  tags: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  color: string;
  size: string;
  product?: Product;
}

export interface Order {
  id: number;
  status: string;
  total_amount: number;
  shipping_address: string;
  payment_status: string;
  session_id: string;
  tracking_number: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  color: string;
  size: string;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  product?: Product;
}

export interface Review {
  id: number;
  product_id: number;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}