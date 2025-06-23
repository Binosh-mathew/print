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
import { Progress } from "@/components/ui/progress";

const Database = () => {
  // Mock database statistics
  const dbStats = {
    connections: 45,
    maxConnections: 100,
    queryPerformance: 85,
    uptime: '99.99%',
    lastBackup: '2024-03-15 02:00 AM',
    size: '2.5GB',
    tables: [
      { name: 'users', rows: 1500, size: '256MB', lastOptimized: '2024-03-14' },
      { name: 'orders', rows: 5000, size: '512MB', lastOptimized: '2024-03-14' },
      { name: 'products', rows: 300, size: '128MB', lastOptimized: '2024-03-15' },
      { name: 'stores', rows: 25, size: '64MB', lastOptimized: '2024-03-15' },
    ]
  };

  return (
    <DeveloperLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Database Management</h1>
          <p className="text-gray-600">Monitor and manage database performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Connections</CardTitle>
              <CardDescription>Active database connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={(dbStats.connections / dbStats.maxConnections) * 100} />
                <p className="text-sm text-muted-foreground">
                  {dbStats.connections} of {dbStats.maxConnections} connections
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <CardDescription>Query performance score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={dbStats.queryPerformance} />
                <p className="text-sm text-muted-foreground">
                  {dbStats.queryPerformance}% optimal
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Database health metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Uptime: {dbStats.uptime}</p>
                <p className="text-sm">Last Backup: {dbStats.lastBackup}</p>
                <p className="text-sm">Total Size: {dbStats.size}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Table Statistics</CardTitle>
            <CardDescription>Overview of database tables</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Last Optimized</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dbStats.tables.map((table) => (
                  <TableRow key={table.name}>
                    <TableCell className="font-medium">{table.name}</TableCell>
                    <TableCell>{table.rows.toLocaleString()}</TableCell>
                    <TableCell>{table.size}</TableCell>
                    <TableCell>{table.lastOptimized}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DeveloperLayout>
  );
};

export default Database; 