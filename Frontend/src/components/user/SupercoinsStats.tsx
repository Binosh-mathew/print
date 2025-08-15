import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, TrendingUp, Eye } from 'lucide-react';

interface SupercoinsStatsProps {
  supercoins: number;
  totalEarned: number;
  loading: boolean;
}

export const SupercoinsStats: React.FC<SupercoinsStatsProps> = ({
  supercoins,
  totalEarned,
  loading,
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      title: "Current Supercoins",
      value: supercoins.toLocaleString(),
      icon: Coins,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      description: "Available to spend"
    },
    {
      title: "Total Earned",
      value: totalEarned.toLocaleString(),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "All time earnings"
    },
    {
      title: "Ads Watched",
      value: totalEarned > 0 ? Math.floor(totalEarned / 10) : 0, // Assuming average 10 coins per ad
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Videos completed"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
