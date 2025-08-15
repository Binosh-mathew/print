import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDown, ArrowUp, FileText } from "lucide-react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import type { Order } from "@/types/order";

interface OrdersTableProps {
  filteredOrders: any[];
  isLoading: boolean;
  showAllOrders: boolean;
  setShowAllOrders: (show: boolean) => void;
  searchQuery: string;
  sortConfig: {
    key: string;
    direction: string;
  };
  handleSort: (key: keyof Order) => void;
  handleOrderClick: (order: Order) => void;
  getPaperAndBindingInfo: (order: Order) => { paper: string; binding: string };
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  filteredOrders,
  isLoading,
  showAllOrders,
  setShowAllOrders,
  searchQuery,
  sortConfig,
  handleSort,
  handleOrderClick,
  getPaperAndBindingInfo,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl">
            {showAllOrders ? "All Orders" : "Orders from Today"} (
            {filteredOrders.length})
          </CardTitle>
          <Button
            variant={showAllOrders ? "outline" : "default"}
            onClick={() => setShowAllOrders(!showAllOrders)}
            className={`w-full sm:w-auto ${
              !showAllOrders ? "bg-primary hover:bg-primary/90" : ""
            }`}
          >
            {showAllOrders ? "Show Today's Orders" : "View All Orders"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center">
                    Order ID
                    {sortConfig.key === "id" &&
                      (sortConfig.direction === "ascending" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("customerName")}
                >
                  <div className="flex items-center">
                    Customer
                    {sortConfig.key === "customerName" &&
                      (sortConfig.direction === "ascending" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Paper Type</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === "createdAt" &&
                      (sortConfig.direction === "ascending" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("totalPrice")}
                >
                  <div className="flex items-center">
                    Amount
                    {sortConfig.key === "totalPrice" &&
                      (sortConfig.direction === "ascending" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === "status" &&
                      (sortConfig.direction === "ascending" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2 text-gray-500">
                        Loading orders...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => {
                  const { paper } = getPaperAndBindingInfo(order);
                  const uniqueKey = order.id || `order-${index}`; // Fallback to index if id is missing
                  return (
                    <TableRow key={uniqueKey}>
                      <TableCell
                        className="font-medium"
                        key={`${uniqueKey}-id`}
                      >
                        #{order.id}
                      </TableCell>
                      <TableCell key={`${uniqueKey}-user`}>
                        {order.customerName ||
                          order.userName ||
                          "Unknown User"}
                      </TableCell>
                      <TableCell
                        className="truncate max-w-[200px]"
                        key={`${uniqueKey}-doc`}
                      >
                        {order.documentName}
                      </TableCell>
                      <TableCell key={`${uniqueKey}-paper`}>
                        {paper}
                      </TableCell>
                      <TableCell
                        className="text-gray-600"
                        key={`${uniqueKey}-date`}
                      >
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell
                        className="font-medium"
                        key={`${uniqueKey}-price`}
                      >
                        ₹{order.totalPrice}
                      </TableCell>
                      <TableCell key={`${uniqueKey}-status`}>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell
                        className="text-right"
                        key={`${uniqueKey}-actions`}
                      >
                        <div
                          className="flex items-center justify-end gap-2"
                          key={`${uniqueKey}-actions-container`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => handleOrderClick(order)}
                            key={`${uniqueKey}-view`}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {showAllOrders
                        ? "No orders found"
                        : "No orders found for today"}
                    </p>
                    {searchQuery && (
                      <p className="text-sm text-gray-400 mt-1">
                        Try a different search term
                      </p>
                    )}
                    {!showAllOrders && !searchQuery && (
                      <p className="text-sm text-gray-400 mt-1">
                        Click "View All Orders" to see orders from previous
                        days
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
