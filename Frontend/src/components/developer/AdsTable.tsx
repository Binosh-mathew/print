import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Pencil, Trash2, Play, Clock, Coins } from 'lucide-react';
import { Ad } from '@/types/ad';

interface AdsTableProps {
  ads: Ad[];
  isLoading: boolean;
  onCreateNew: () => void;
  onEdit: (ad: Ad) => void;
  onDelete: (adId: string) => void;
  onPreview: (ad: Ad) => void;
}

export const AdsTable: React.FC<AdsTableProps> = ({
  ads,
  isLoading,
  onCreateNew,
  onEdit,
  onDelete,
  onPreview,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advertisements</CardTitle>
          <CardDescription>Loading advertisements...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Advertisements</CardTitle>
          <CardDescription>
            Manage your advertisement campaigns
          </CardDescription>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Create New Ad
        </Button>
      </CardHeader>
      <CardContent>
        {ads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No advertisements found</p>
            <Button onClick={onCreateNew} variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Ad
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => (
                  <TableRow key={ad.id || ad._id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{ad.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ad.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ad.active ? "default" : "secondary"}>
                        {ad.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(ad.duration)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3 text-yellow-500" />
                        {ad.rewardCoins}
                      </div>
                    </TableCell>
                    <TableCell>
                      {ad.createdAt 
                        ? new Date(ad.createdAt).toLocaleDateString()
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPreview(ad)}
                          className="h-8 w-8 p-0"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(ad)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(ad.id || ad._id || '')}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
