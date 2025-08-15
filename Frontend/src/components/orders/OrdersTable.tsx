import { ArrowDown, ArrowUp, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { parseColorPages } from "@/utils/printUtils";

interface OrdersTableProps {
  orders: any[];
  sortConfig: {
    key: string;
    direction: string;
  };
  onSort: (key: string) => void;
  onOrderSelect: (order: any) => void;
  isLoading: boolean;
}

export const OrdersTable = ({
  orders,
  sortConfig,
  onSort,
  onOrderSelect,
  isLoading,
}: OrdersTableProps) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  const calculatePages = (order: any) => {
    if (!order.files || order.files.length === 0) return "0";

    const totalPages = order.files.reduce((total: number, file: any) => {
      const blackPages = parseInt(file.blackPages) || 0;
      const colorInfo = parseColorPages(file.colorPages);
      const colorPages = Array.isArray(colorInfo) 
        ? colorInfo.reduce((sum, page) => sum + page, 0)
        : colorInfo || 0;
      return total + blackPages + colorPages;
    }, 0);

    return totalPages.toString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
        <p className="mt-1 text-sm text-gray-500">
          No orders match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => onSort("id")}
            >
              <div className="flex items-center">
                Order ID
                {getSortIcon("id")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => onSort("customerName")}
            >
              <div className="flex items-center">
                Customer
                {getSortIcon("customerName")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => onSort("status")}
            >
              <div className="flex items-center">
                Status
                {getSortIcon("status")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => onSort("totalPrice")}
            >
              <div className="flex items-center">
                Total
                {getSortIcon("totalPrice")}
              </div>
            </TableHead>
            <TableHead>Pages</TableHead>
            <TableHead>Files</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => onSort("createdAt")}
            >
              <div className="flex items-center">
                Created
                {getSortIcon("createdAt")}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order._id || order.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onOrderSelect(order)}
            >
              <TableCell className="font-mono text-sm">
                #{order.id}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{order.customerName}</div>
                  {order.phoneNumber && (
                    <div className="text-sm text-gray-500">
                      {order.phoneNumber}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="font-medium">
                ₹{order.totalPrice}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {calculatePages(order)}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {order.files?.length || 0}
                </span>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
