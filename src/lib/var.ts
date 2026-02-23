/** @format */
import {
  Home,
  Users,
  ShoppingCart,
  CreditCard,
  ListOrdered,
  Truck,
  Settings,
  MessageCircle,
  User,
  BarChart3,
} from "lucide-react";

export const ValidPath = [
  "",
  "users",
  "orders",
  "sales",
  "payments",
  "queue",
  "delivery",
  "settings",
  "whatsapp",
];

export const DefaultMenu = [
  { id: 1, text: "Home", icon: Home, href: "/" },
  { id: 2, text: "Orders", icon: ShoppingCart, href: "/orders" },
  { id: 3, text: "Sales", icon: User, href: "/sales" },
  // { id: 4, text: "Payment", icon: CreditCard, href: "/payments" },
  // { id: 5, text: "Queue", icon: ListOrdered, href: "/queue" },
  // { id: 6, text: "Delivery", icon: Truck, href: "/delivery" },
  { id: 7, text: "Settings", icon: Settings, href: "/settings" },
  { id: 8, text: "WhatsApp", icon: MessageCircle, href: "/whatsapp" },
];

export const SuperMenu = [
  { id: 1, text: "Home", icon: Home, href: "/" },
    { id: 2, text: "Access", icon: Users, href: "/users" },
  { id: 3, text: "Orders", icon: ShoppingCart, href: "/orders" },
  { id: 4, text: "Sales", icon: User, href: "/sales" },
  // { id: 5, text: "Payment", icon: CreditCard, href: "/payments" },
  // { id: 6, text: "Queue", icon: ListOrdered, href: "/queue" },
  // { id: 7, text: "Delivery", icon: Truck, href: "/delivery" },
  { id: 8, text: "Settings", icon: Settings, href: "/settings" },
  { id: 9, text: "WhatsApp", icon: MessageCircle, href: "/whatsapp" },
];

export const LocalToken = "labalaba_auth_token";
export const LocalRefreshToken = "labalaba_refresh_token";

export const colors = [
  "#238b45",
  "#D0229F",
  "#7C3AED",
  "#F59E0B",
  "#EF4444",
  "#10B981",
  "#3B82F6",
  "#EC4899",
  "#8B5CF6",
  "#14B8A6",
  "#F97316",
  "#06B6D4",
];
