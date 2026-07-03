import { StatusVariant } from "@/components/ui/status-badge";

export interface KPI {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
}

export interface Order {
  id: string;
  table: string;
  status: StatusVariant;
  time: string;
  total: number;
}

export interface TopItem {
  id: string;
  name: string;
  category: string;
  sold: number;
  revenue: number;
}

export const MOCK_KPIS: KPI[] = [
  { title: "Today's Sales", value: "$3,240.50", trend: "+12.5%", isPositive: true },
  { title: "Total Orders", value: "142", trend: "+5.2%", isPositive: true },
  { title: "Avg. Ticket Size", value: "$22.82", trend: "-1.1%", isPositive: false },
  { title: "Active Tables", value: "18 / 24", trend: "75%", isPositive: true },
];

export interface Category {
  id: string;
  name: string;
  active: boolean;
  displayOrder: number;
  productCount: number;
  kitchenStation: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  availableForSale: boolean;
  sendToKitchen: boolean;
}

export interface DetailedOrder extends Order {
  source: string;
  paymentStatus: StatusVariant;
  responsibleStaff: string;
  items: number;
  itemsDetail: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    preparationStatus: StatusVariant;
    variants?: string;
    addons?: string;
    instructions?: string;
  }[];
  timeline: {
    time: string;
    event: string;
    actor: string;
  }[];
}

export interface Floor {
  id: string;
  name: string;
  active: boolean;
}

export type TableStatus = 'Available' | 'Occupied' | 'Preparing' | 'Ready' | 'Waiting Payment' | 'Cleaning';

export interface RestaurantTable {
  id: string;
  floorId: string;
  number: string;
  seats: number;
  status: TableStatus;
  active: boolean;
  currentOrderId?: string;
  currentAmount?: number;
  assignedWaiter?: string;
  timeOccupied?: string;
}

export interface POSSession {
  id: string;
  cashier: string;
  terminal: string;
}

export interface KitchenStation {
  id: string;
  name: string;
  categories: string[];
  products: string[];
  active: boolean;
}

export interface KitchenTicketItem {
  id: string;
  name: string;
  qty: number;
  instructions?: string;
  completed: boolean;
}

export interface KitchenTicket {
  id: string;
  orderId: string;
  table: string;
  source: string;
  time: string;
  items: KitchenTicketItem[];
  status: 'To Cook' | 'Preparing' | 'Completed';
  station: string;
  delayed: boolean;
  elapsedTime: string;
}

export interface PaymentMethodConfig {
  id: string;
  type: 'cash' | 'card' | 'upi';
  name: string;
  active: boolean;
  upiId?: string;
  upiName?: string;
}

export interface POSTerminal {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  currentSessionId?: string;
  lastClosingAmount?: number;
  responsibleCashier?: string;
}

export interface POSSessionSummary {
  id: string;
  terminalId: string;
  cashier: string;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
  expectedCash?: number;
  countedCash?: number;
  difference?: number;
  cashSales?: number;
  cardSales?: number;
  upiSales?: number;
}

export const MOCK_FLOORS: Floor[] = [
  { id: "FL-1", name: "Ground Floor", active: true },
  { id: "FL-2", name: "First Floor", active: true },
  { id: "FL-3", name: "Terrace", active: false },
];

export const MOCK_TABLES: RestaurantTable[] = [
  { id: "TBL-1", floorId: "FL-1", number: "01", seats: 4, status: "Available", active: true },
  { id: "TBL-2", floorId: "FL-1", number: "02", seats: 2, status: "Occupied", active: true, currentOrderId: "ORD-1049", currentAmount: 45.50, assignedWaiter: "Sarah", timeOccupied: "15m" },
  { id: "TBL-3", floorId: "FL-1", number: "03", seats: 4, status: "Waiting Payment", active: true, currentOrderId: "ORD000124", currentAmount: 794.40, assignedWaiter: "Alex", timeOccupied: "45m" },
  { id: "TBL-4", floorId: "FL-1", number: "04", seats: 6, status: "Preparing", active: true, currentOrderId: "ORD-1052", currentAmount: 112.00, assignedWaiter: "John", timeOccupied: "22m" },
  { id: "TBL-5", floorId: "FL-1", number: "05", seats: 2, status: "Ready", active: true, currentOrderId: "ORD-1055", currentAmount: 28.75, assignedWaiter: "Sarah", timeOccupied: "30m" },
  { id: "TBL-6", floorId: "FL-1", number: "06", seats: 8, status: "Cleaning", active: true },
  { id: "TBL-7", floorId: "FL-2", number: "201", seats: 4, status: "Available", active: true },
  { id: "TBL-8", floorId: "FL-2", number: "202", seats: 2, status: "Available", active: true },
];

export const MOCK_POS_SESSION: POSSession = {
  id: "SES-024",
  cashier: "Rahul",
  terminal: "Main Counter"
};

export const MOCK_KITCHEN_STATIONS: KitchenStation[] = [
  { id: "STA-1", name: "Main Kitchen", categories: ["Burgers", "Pasta"], products: [], active: true },
  { id: "STA-2", name: "Pizza Station", categories: ["Pizza"], products: [], active: true },
  { id: "STA-3", name: "Beverage Station", categories: ["Beverages"], products: [], active: true },
  { id: "STA-4", name: "Dessert Station", categories: ["Desserts"], products: [], active: true },
];

export const MOCK_KITCHEN_TICKETS: KitchenTicket[] = [
  {
    id: "TKT-1",
    orderId: "#ORD000124",
    table: "Table 03",
    source: "QR Self Order",
    time: "12:45 PM",
    elapsedTime: "12:30",
    status: "To Cook",
    station: "Pizza Station",
    delayed: true,
    items: [
      { id: "I1", name: "Margherita Pizza", qty: 1, completed: false, instructions: "Extra cheese" },
      { id: "I2", name: "Cheese Burger", qty: 1, completed: false }
    ]
  },
  {
    id: "TKT-2",
    orderId: "#ORD000125",
    table: "Table 04",
    source: "Waiter App",
    time: "12:50 PM",
    elapsedTime: "07:15",
    status: "Preparing",
    station: "Main Kitchen",
    delayed: false,
    items: [
      { id: "I3", name: "Pasta Alfredo", qty: 2, completed: true },
      { id: "I4", name: "Garlic Bread", qty: 1, completed: false }
    ]
  },
];

export const MOCK_PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: "PM-1", type: "cash", name: "Cash", active: true },
  { id: "PM-2", type: "card", name: "Card / Digital", active: true },
  { id: "PM-3", type: "upi", name: "UPI QR", active: true, upiId: "cafehub@upi", upiName: "Cafe Hub" },
];

export const MOCK_POS_TERMINALS: POSTerminal[] = [
  { id: "TER-1", name: "Main Counter POS", location: "Ground Floor", status: "online", currentSessionId: "SES-024", responsibleCashier: "Rahul", lastClosingAmount: 500 },
  { id: "TER-2", name: "Bar POS", location: "Ground Floor", status: "offline", lastClosingAmount: 200 },
];

export const MOCK_POS_SESSION_SUMMARIES: POSSessionSummary[] = [
  { id: "SES-024", terminalId: "TER-1", cashier: "Rahul", status: "open", openedAt: "09:00 AM" }
];

export const MOCK_CATEGORIES: Category[] = [
  { id: "CAT-1", name: "Pizza", active: true, displayOrder: 1, productCount: 12, kitchenStation: "Oven" },
  { id: "CAT-2", name: "Burgers", active: true, displayOrder: 2, productCount: 8, kitchenStation: "Grill" },
  { id: "CAT-3", name: "Pasta", active: true, displayOrder: 3, productCount: 5, kitchenStation: "Hot Line" },
  { id: "CAT-4", name: "Beverages", active: true, displayOrder: 4, productCount: 15, kitchenStation: "Bar" },
  { id: "CAT-5", name: "Desserts", active: true, displayOrder: 5, productCount: 6, kitchenStation: "Pantry" },
  { id: "CAT-6", name: "Sides", active: false, displayOrder: 6, productCount: 4, kitchenStation: "Fryer" },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: "PRD-1", name: "Classic Cheeseburger", description: "Beef patty with cheddar", categoryId: "CAT-2", categoryName: "Burgers", price: 14.50, availableForSale: true, sendToKitchen: true },
  { id: "PRD-2", name: "Truffle Fries", description: "Crispy fries with truffle oil", categoryId: "CAT-6", categoryName: "Sides", price: 7.00, availableForSale: true, sendToKitchen: true },
  { id: "PRD-3", name: "Iced Latte", description: "Espresso with milk and ice", categoryId: "CAT-4", categoryName: "Beverages", price: 4.50, availableForSale: true, sendToKitchen: false },
  { id: "PRD-4", name: "Margherita Pizza", description: "Tomato, mozzarella, basil", categoryId: "CAT-1", categoryName: "Pizza", price: 16.00, availableForSale: false, sendToKitchen: true },
];

export const MOCK_ORDERS: DetailedOrder[] = [
  { 
    id: "ORD-1042", table: "T-04", status: "preparing", time: "14:28", total: 45.50, 
    source: "POS", paymentStatus: "success", responsibleStaff: "Alex M.", items: 3,
    itemsDetail: [
      { id: "ITM-1", name: "Classic Cheeseburger", quantity: 2, price: 14.50, preparationStatus: "preparing" },
      { id: "ITM-2", name: "Truffle Fries", quantity: 1, price: 7.00, preparationStatus: "preparing" }
    ],
    timeline: [
      { time: "14:28", event: "Order placed", actor: "Alex M." },
      { time: "14:29", event: "Sent to kitchen", actor: "System" }
    ]
  },
  { id: "ORD-1043", table: "T-12", status: "waiting", time: "14:25", total: 112.00, source: "QR Self Order", paymentStatus: "unpaid", responsibleStaff: "Unassigned", items: 5, itemsDetail: [], timeline: [] },
  { id: "ORD-1044", table: "T-02", status: "ready", time: "14:15", total: 28.75, source: "Waiter", paymentStatus: "success", responsibleStaff: "Sarah K.", items: 2, itemsDetail: [], timeline: [] },
  { id: "ORD-1045", table: "T-08", status: "unpaid", time: "13:50", total: 85.20, source: "POS", paymentStatus: "unpaid", responsibleStaff: "Alex M.", items: 4, itemsDetail: [], timeline: [] },
  { id: "ORD-1046", table: "Takeaway", status: "success", time: "13:42", total: 15.00, source: "Kiosk", paymentStatus: "success", responsibleStaff: "System", items: 1, itemsDetail: [], timeline: [] },
];

export const MOCK_TOP_ITEMS: TopItem[] = [
  { id: "ITM-01", name: "Classic Cheeseburger", category: "Mains", sold: 42, revenue: 630.00 },
  { id: "ITM-02", name: "Truffle Fries", category: "Sides", sold: 38, revenue: 266.00 },
  { id: "ITM-03", name: "Iced Latte", category: "Beverages", sold: 35, revenue: 157.50 },
  { id: "ITM-04", name: "Margherita Pizza", category: "Mains", sold: 29, revenue: 406.00 },
];

export const MOCK_KITCHEN_PULSE = {
  avgPrepTime: "12m",
  pendingTickets: 8,
  delayedTickets: 1,
};
