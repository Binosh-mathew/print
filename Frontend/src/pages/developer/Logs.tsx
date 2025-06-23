import React from 'react';
import DeveloperLayout from '@/components/layouts/DeveloperLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download } from 'lucide-react';

const Logs = () => {
  // Mock logs data
  const logs = [
    { id: 1, timestamp: '2024-03-15 14:30:00', level: 'ERROR', service: 'OrderService', message: 'Failed to process order #1234' },
    { id: 2, timestamp: '2024-03-15 14:29:00', level: 'INFO', service: 'UserService', message: 'User login successful' },
    { id: 3, timestamp: '2024-03-15 14:28:00', level: 'WARN', service: 'DatabaseService', message: 'High connection pool usage' },
    { id: 4, timestamp: '2024-03-15 14:27:00', level: 'INFO', service: 'PrintService', message: 'Print job completed successfully' },
    { id: 5, timestamp: '2024-03-15 14:26:00', level: 'ERROR', service: 'PaymentService', message: 'Payment gateway timeout' },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-500 bg-red-50';
      case 'WARN':
        return 'text-yellow-500 bg-yellow-50';
      case 'INFO':
        return 'text-blue-500 bg-blue-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <DeveloperLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Logs</h1>
          <p className="text-gray-600">Monitor and analyze system logs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Log Search</CardTitle>
            <CardDescription>Search and filter system logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search logs..."
                  className="w-full"
                />
              </div>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
            <CardDescription>Latest system events and errors</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono">{log.timestamp}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                    </TableCell>
                    <TableCell>{log.service}</TableCell>
                    <TableCell>{log.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Log Statistics</CardTitle>
            <CardDescription>Overview of log events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-red-50">
                <p className="text-sm font-medium text-red-600">Errors</p>
                <p className="text-2xl font-bold text-red-700">2</p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50">
                <p className="text-sm font-medium text-yellow-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-700">1</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50">
                <p className="text-sm font-medium text-blue-600">Info</p>
                <p className="text-2xl font-bold text-blue-700">2</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-700">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DeveloperLayout>
  );
};

export default Logs; 