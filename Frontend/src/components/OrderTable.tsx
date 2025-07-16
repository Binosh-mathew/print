import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { type Order } from "@/types/order";
import { getPaperAndBindingInfo } from "@/utils/orderUtils";

interface OrderTableProps {
  orders: Order[];
}

const OrderTable: React.FC<OrderTableProps> = ({ orders }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">No orders found</p>
        <p className="text-gray-400 text-sm mb-4">Your order history will appear here after you create an order.</p>
        <Link to="/new-order">
          <Button className="mt-4 bg-primary hover:bg-primary-500">
            Create your first order
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              Order ID
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              Document
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              Date
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              Copies
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              Paper
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              Type
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              Price
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              Status
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const { paper } = getPaperAndBindingInfo(order);
            return (
              <tr
                key={order._id || order.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 px-4 text-sm text-gray-600">
                  #{order.orderId}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <FileText
                      size={16}
                      className="text-gray-400 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                      {order.documentName || order.customerName}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(
                    order.orderDate || order.createdAt || ""
                  ).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {order.copies || 1}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {paper}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {order.colorType === "color" ? "Color" : "B&W"}
                  {order.doubleSided ? ", Double-sided" : ""}
                </td>
                <td className="py-3 px-4 text-sm font-medium">
                  ₹{order.totalPrice || 0}
                </td>
                <td className="py-3 px-4">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/orders/${order._id || order.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary h-8"
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
