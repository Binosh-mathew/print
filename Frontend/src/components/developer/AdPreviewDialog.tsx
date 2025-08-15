import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Coins, Video } from 'lucide-react';
import { Ad } from '@/types/ad';

interface AdPreviewDialogProps {
  ad: Ad | null;
  onClose: () => void;
}

export const AdPreviewDialog: React.FC<AdPreviewDialogProps> = ({
  ad,
  onClose,
}) => {
  if (!ad) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={!!ad} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Advertisement Preview
          </DialogTitle>
          <DialogDescription>
            Preview how this advertisement will appear to users
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ad Status and Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={ad.active ? "default" : "secondary"}>
                {ad.active ? "Active" : "Inactive"}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDuration(ad.duration)}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Coins className="h-3 w-3 text-yellow-500" />
                {ad.rewardCoins} coins
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <h3 className="text-xl font-semibold">{ad.title}</h3>
            </div>

            {/* Video Player */}
            {ad.videoUrl && (
              <Card>
                <CardContent className="p-4">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video 
                      src={ad.videoUrl}
                      poster={ad.thumbnailUrl}
                      controls
                      className="w-full h-full object-contain"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Thumbnail Preview (if no video) */}
            {!ad.videoUrl && ad.thumbnailUrl && (
              <Card>
                <CardContent className="p-4">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img 
                      src={ad.thumbnailUrl}
                      alt={ad.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {ad.description}
              </p>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <span className="text-sm font-medium">Created:</span>
                <p className="text-sm text-muted-foreground">
                  {ad.createdAt 
                    ? new Date(ad.createdAt).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Last Updated:</span>
                <p className="text-sm text-muted-foreground">
                  {ad.updatedAt 
                    ? new Date(ad.updatedAt).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>

            {/* Reward Information */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Reward Information</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Users will earn <strong>{ad.rewardCoins} coins</strong> for watching this {formatDuration(ad.duration)} advertisement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
