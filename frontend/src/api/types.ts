export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  bonus_balance: number;
  loyalty_tier: "bronze" | "silver" | "gold";
  cashback_percent: number;
  referral_code: string;
  created_at: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  collection: string | null;
  image_url: string | null;
  in_stock: boolean;
  avg_rating: number;
  reviews_count: number;
}

export type OrderStatus = "new" | "processing" | "confirmed" | "shipped" | "done" | "cancelled";

export interface Order {
  id: number;
  product_id: number;
  quantity: number;
  status: OrderStatus;
  comment: string | null;
  created_at: string;
  product: Product;
}

export interface BonusEvent {
  id: number;
  amount: number;
  reason: string;
  created_at: string;
}

export interface ReferralStats {
  referral_code: string;
  referral_link: string;
  invited_count: number;
  rewarded_count: number;
  total_earned: number;
}

export interface Review {
  id: number;
  client_id: number;
  product_id: number;
  rating: number;
  text: string;
  photo_url: string | null;
  status: "published" | "hidden";
  created_at: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Новая",
  processing: "В обработке",
  confirmed: "Подтверждена",
  shipped: "Отправлена",
  done: "Выполнена",
  cancelled: "Отменена",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export const TIER_LABELS: Record<Client["loyalty_tier"], string> = {
  bronze: "Бронза",
  silver: "Серебро",
  gold: "Золото",
};

// TODO: держать в синхроне с backend/app/config.py (LOYALTY_THRESHOLDS)
export const TIER_THRESHOLDS: Record<Client["loyalty_tier"], number> = {
  bronze: 0,
  silver: 10_000,
  gold: 30_000,
};

export const TIER_ORDER: Client["loyalty_tier"][] = ["bronze", "silver", "gold"];
