import React from 'react';
import DeveloperLayout from '@/components/layouts/DeveloperLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { platformStats, maintenanceMode, toggleMaintenanceMode } from '@/services/mockData';
import { toast } from "@/components/ui/use-toast";

const SystemStatus = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = React.useState(maintenanceMode);
  const storagePercentage = (platformStats.storageUsed / platformStats.totalStorage) * 100;
  const isStorageCritical = storagePercentage > 90;

  const handleMaintenanceToggle = (enabled: boolean) => {
    setIsMaintenanceMode(enabled);
    toggleMaintenanceMode(enabled);
    toast({
      title: enabled ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
      description: enabled ? "The platform is now in maintenance mode." : "The platform is now active.",
    });
  };

  return (
    <DeveloperLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Status</h1>
          <p className="text-gray-600">Monitor and control system-wide settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Controls</CardTitle>
            <CardDescription>Manage system-wide settings and maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle platform-wide maintenance mode
                </p>
              </div>
              <Switch
                checked={isMaintenanceMode}
                onCheckedChange={handleMaintenanceToggle}
              />
            </div>

            <div>
              <Label>Storage Usage</Label>
              <Progress value={storagePercentage} className="mt-2" />
              <p className={`text-sm mt-1 ${isStorageCritical ? 'text-red-500' : 'text-muted-foreground'}`}>
                {platformStats.storageUsed}GB / {platformStats.totalStorage}GB
                {isStorageCritical && ' - Critical storage level!'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DeveloperLayout>
  );
};

export default SystemStatus; 