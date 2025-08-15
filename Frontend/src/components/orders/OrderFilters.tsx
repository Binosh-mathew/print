import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search } from "lucide-react";

interface OrderFiltersProps {
  searchQuery: string;
  statusFilter: string;
  showAllOrders: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onToggleShowAllOrders: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const OrderFilters = ({
  searchQuery,
  statusFilter,
  showAllOrders,
  onSearchChange,
  onStatusFilterChange,
  onToggleShowAllOrders,
  onRefresh,
  isLoading,
}: OrderFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search orders by ID, customer name, phone, or file name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-48">
          <Filter className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant={showAllOrders ? "default" : "outline"}
        onClick={onToggleShowAllOrders}
        className="w-full sm:w-auto"
      >
        {showAllOrders ? "Show Today's Orders" : "Show All Orders"}
      </Button>
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        {isLoading ? "Loading..." : "Refresh"}
      </Button>
    </div>
  );
};
