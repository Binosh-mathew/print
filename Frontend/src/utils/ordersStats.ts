import { Order } from "@/types/order";

interface MonthlyOrderData {
  name: string;
  revenue: number;
  completed: number;
  pending: number;
  total: number;
}

interface ChartData {
  revenueData: Array<{ name: string; revenue: number }>;
  ordersData: Array<{
    name: string;
    completed: number;
    pending: number;
    total: number;
  }>;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const generateMonthlyData = (orders: Order[]): MonthlyOrderData[] => {
  const currentYear = new Date().getFullYear();

  const monthlyData = MONTH_NAMES.map((month) => ({
    name: month,
    revenue: 0,
    completed: 0,
    pending: 0,
    total: 0,
  }));

  orders.forEach((order) => {
    if (!order.createdAt) return;

    const orderDate = new Date(order.createdAt);
    if (orderDate.getFullYear() !== currentYear) return;

    const monthIndex = orderDate.getMonth();
    const price = parseFloat(order.totalPrice?.toString() || '0');
    const status = order.status?.toLowerCase() || "";

    monthlyData[monthIndex].total += 1;
    monthlyData[monthIndex].revenue += price;

    if (status === "completed") {
      monthlyData[monthIndex].completed += 1;
    } else if (status === "pending") {
      monthlyData[monthIndex].pending += 1;
    }
  });

  return monthlyData;
};

export const getCurrentYearData = (orders: Order[]): ChartData => {
  const monthlyData = generateMonthlyData(orders);
  const currentMonth = new Date().getMonth();
  const startMonth = Math.max(0, currentMonth - 5);
  const chartData = monthlyData.slice(startMonth, currentMonth + 1);

  return {
    revenueData: chartData.map((month) => ({
      name: month.name,
      revenue: parseFloat(month.revenue.toFixed(2)),
    })),
    ordersData: chartData.map((month) => ({
      name: month.name,
      completed: month.completed,
      pending: month.pending,
      total: month.total,
    })),
  };
};