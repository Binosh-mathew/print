import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Coins } from 'lucide-react';
import { Ad } from '@/types/ad';

interface AdsListProps {
  ads: Ad[];
  loading: boolean;
  error: string | null;
  onWatchAd: (ad: Ad) => void;
}

export const AdsList: React.FC<AdsListProps> = ({
  ads,
  loading,
  error,
  onWatchAd,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!ads || ads.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Play className="w-12 h-12 text-gray-400" />
            <h3 className="text-lg font-medium">No Ads Available</h3>
            <p className="text-gray-500">
              Check back later for new advertisements to watch and earn supercoins!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {ads.map((ad) => (
        <Card key={ad.id || ad._id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {ad.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {ad.description}
                </CardDescription>
              </div>
              <Badge variant={ad.active ? "default" : "secondary"} className="ml-2">
                {ad.active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Thumbnail */}
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {ad.thumbnailUrl ? (
                <img
                  src={ad.thumbnailUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Play className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Ad Details */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{formatDuration(ad.duration)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{ad.rewardCoins}</span>
                </div>
              </div>
            </div>

            {/* Watch Button */}
            <Button
              onClick={() => onWatchAd(ad)}
              className="w-full"
              disabled={!ad.active}
            >
              <Play className="w-4 h-4 mr-2" />
              {ad.active ? 'Watch & Earn' : 'Not Available'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
